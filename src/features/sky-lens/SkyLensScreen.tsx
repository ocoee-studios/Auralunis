import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { captureRef, captureScreen } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { Horizon, Observer } from "astronomy-engine";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { CameraView } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuraLunisColors } from "@/theme/tokens";
import { useAuraLunisVault } from "@/state/AuraLunisVaultContext";
import { useEntitlement } from "@/hooks/useEntitlement";
import { usePaywallNavigation } from "@/context/PaywallNavigationContext";
import { useObserverLocation } from "./ephemeris/useObserverLocation";
import { useAuraLunisSettings } from "@/state/AuraLunisSettingsContext";
import { SKY_PROFILES, getSeasonalTint, getMagnificentBoost, type SkyQuality } from "@/services/SkyQualityService";
import { computeStargazingIndex } from "@/services/StargazingIndexService";
import { fetchCurrentWeather, type WeatherSnapshot } from "@/services/WeatherService";
import { useDevicePointing } from "./ar/useDevicePointing";
import { useParallaxOffset } from "./ar/useParallaxOffset";
import { getFleet, simulateTick, syncLiveTLEData } from "@/services/AtmosphereExplorerService";
import { onObjectTapped, onObjectCentered } from "@/services/HapticDiscoveryService";
import { computeAzimuthElevation } from "@/utils/alignmentEngine";
import type { SkyLensSatellite } from "./layers/SatelliteLayer";
import { useSkyData } from "./hooks/useSkyProjection";
import { SkyLensCanvas } from "./SkyLensCanvas";
import { PremiumSkyBloomLayer } from "./layers/PremiumSkyBloomLayer";
import { AstralBreathingLayer } from "./layers/AstralBreathingLayer";
import { LuxuryStarfieldFXLayer } from "./layers/LuxuryStarfieldFXLayer";
import { LunarGodRayLayer } from "./layers/LunarGodRayLayer";
import { OrbitalGhostTrailsLayer } from "./layers/OrbitalGhostTrailsLayer";
import { AuroraCurtainLayer } from "./layers/AuroraCurtainLayer";
import { ConstellationForgeLayer, type ForgePoint, type ForgeSegment } from "./layers/ConstellationForgeLayer";
import { SkyLensLayerBar } from "./SkyLensLayerBar";
import { SkyLensInfoCard } from "./SkyLensInfoCard";
import { SkyLensErrorBoundary } from "./SkyLensErrorBoundary";
import { TwinkleOverlay, type TwinkleTarget } from "./TwinkleOverlay";
import { TimeScrubBar } from "./TimeScrubBar";
import { TargetPulse } from "./TargetPulse";
import { HeroSpotlight } from "./HeroSpotlight";
import { DEFAULT_ACTIVE_LAYERS, type LayerDef, type LayerKey } from "./SkyLensLayerCatalog";
import { projectTarget, DEFAULT_FOV } from "./ar/SkyLensProjection";
import { skyGradient, starColor, type SelectedObject, type FocusZone } from "./SkyLensVisual";
import { getVisualGate } from "./PremiumVisualGating";

// A Find-Mode target handed in from Learn ("See in Sky Lens") — RA/Dec + lesson copy.
export type FocusTarget = {
  raHours: number;
  decDegrees: number;
  name: string;
  subtitle?: string;
  description?: string;
};

type Props = { onClose: () => void; focusTarget?: FocusTarget | null };

type LayoutEvent = { nativeEvent: { layout: { width: number; height: number } } };

// Screen-space bearing (0=right, 90=down, …) → an arrow glyph for the Moon finder.
const ARROWS = ["→", "↘", "↓", "↙", "←", "↖", "↑", "↗"];
const arrowFor = (bearingDegrees: number) => ARROWS[Math.round(bearingDegrees / 45) % 8];

// Full-screen AR Sky Lens (Phase 1): live camera feed with the Stars,
// Constellations, Planets, Moon, and Grid layers projected over it, a toggle
// bar, tap-to-reveal Info Card, and Night Mode. Phase-2 layers appear locked.
export function SkyLensScreen({ onClose, focusTarget }: Props) {
  const insets = useSafeAreaInsets();
  const { location, status } = useObserverLocation();
  // Zoom state lives up here so the device-pointing smoothing can ramp with it.
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  zoomRef.current = zoom;
  // Ramp EMA smoothing DOWN (steadier, more damped) as zoom climbs, because a
  // narrow FOV amplifies hand-shake: ~0.32 at 1× → 0.10 at 12×.
  const smoothAlpha = Math.max(0.1, 0.32 - (zoom - 1) * 0.02);
  const { pointing, available } = useDevicePointing(120, 0, smoothAlpha);
  const parallax = useParallaxOffset();
  // Time Scrub: when the scrub bar is dragged, freeze the sky to the offset instant.
  const [timeOffsetMin, setTimeOffsetMin] = useState(0);
  const [scrubVisible, setScrubVisible] = useState(false);
  const observerTime = useMemo(
    () => (timeOffsetMin === 0 ? null : new Date(Date.now() + timeOffsetMin * 60_000)),
    [timeOffsetMin]
  );
  const sky = useSkyData(location, undefined, observerTime);

  // Photo capture — captureScreen grabs the full rendered screen including SVG
  const sceneRef = useRef<View>(null);
  const [capturing, setCapturing] = useState(false);
  const flash = useRef(new Animated.Value(0)).current;
  const captureSky = useCallback(async () => {
    if (capturing) return;
    setCapturing(true);
    try {
      const uri = await captureScreen({ format: "jpg", quality: 0.85, result: "tmpfile" });
      setCapturing(false);
      if (await Sharing.isAvailableAsync()) {
        Sharing.shareAsync(uri, { mimeType: "image/jpeg" });
      }
    } catch (e) {
      setCapturing(false);
      Alert.alert(
        "Tip: Use iOS Screenshot",
        "Press Power + Volume Up for the best sky photos. Captures everything perfectly including the camera feed."
      );
    }
  }, [capturing]);
  const { isPremium } = useEntitlement();
  // Premium visual gate — FREE sees a good sky map, PREMIUM the living universe.
  // Drives star colours, constellation nodes, planet/moon detail, MW boost, shooting
  // stars, and the cinematic/immersive/night-vision/capture modes (all below).
  const gate = useMemo(() => getVisualGate(isPremium), [isPremium]);
  const { openPaywall } = usePaywallNavigation();
  const { addItem } = useAuraLunisVault();

  const [box, setBox] = useState({ width: 360, height: 720 });
  const [active, setActive] = useState<Set<LayerKey>>(() => new Set(DEFAULT_ACTIVE_LAYERS));

  // Live satellite tracking for the AR "Satellites" layer — reuses the Orbital fleet
  // service (live-TLE-backed positions → absolute observer az/alt). Refreshed every
  // 1 s; the projection uses the live pointing, so satellites track smoothly between
  // updates. Only runs while the layer is on.
  const [satellites, setSatellites] = useState<SkyLensSatellite[]>([]);
  const satellitesActive = active.has("satellites");
  useEffect(() => {
    if (!satellitesActive) {
      setSatellites([]);
      return;
    }
    let alive = true;
    void syncLiveTLEData().catch(() => {});
    const tick = () => {
      simulateTick();
      if (!alive) return;
      setSatellites(
        getFleet().map((sat) => {
          const { azimuth, elevation } = computeAzimuthElevation(location, {
            id: sat.id,
            name: sat.name,
            latitudeDegrees: sat.latitudeDegrees,
            longitudeDegrees: sat.longitudeDegrees,
            altitudeKm: sat.altitudeKm,
          });
          return {
            id: sat.id,
            name: sat.name,
            shortName: sat.shortName,
            altitudeKm: sat.altitudeKm,
            azimuthDegrees: azimuth,
            elevationDegrees: elevation,
          };
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [satellitesActive, location]);
  // Night Vision is shared with Settings: seed from the saved flag on open, write
  // back on toggle so the two stay in sync.
  const { settings, updateSetting } = useAuraLunisSettings();
  // Night Vision is premium — free users always start in normal (day) palette even
  // if a stale saved flag says otherwise.
  const [nightMode, setNightMode] = useState(gate.nightVision && settings.nightVision);
  // Three sky modes cycled by the half-moon button: AR (camera, 45% dim) → Immersive
  // (camera, 75% dim — screenshot mode) → Planetarium (camera off, 95% dim) → AR.
  const [skyMode, setSkyMode] = useState<"ar" | "immersive" | "planetarium">("ar");
  const planetarium = skyMode === "planetarium";
  const immersive = skyMode === "immersive";
  // Cinematic "Immersive Sky" (Week 4) — the no-UI mode for screenshots & wonder. All
  // chrome and labels vanish; only the sky remains, darkened to ~85%. Enter via a
  // triple-tap or a long-press on the mode button; a single tap anywhere restores the UI.
  const [cinematic, setCinematic] = useState(false);
  const cinematicHint = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!cinematic) return;
    cinematicHint.setValue(0);
    const anim = Animated.sequence([
      Animated.timing(cinematicHint, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(cinematicHint, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [cinematic, cinematicHint]);
  const [selected, setSelected] = useState<SelectedObject | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());

  // Pinch-to-zoom: zoom magnifies the sky by narrowing the field of view (and
  // nudges the camera's optical zoom to match). 1× = full 60°×45° FOV.
  const zoomStart = useRef(1);
  const pinch = useMemo(
    () =>
      Gesture.Pinch()
        .runOnJS(true)
        .onStart(() => {
          zoomStart.current = zoomRef.current;
        })
        .onUpdate((e) => setZoom(Math.max(1, Math.min(12, zoomStart.current * e.scale)))),
    []
  );
  // Cinematic Immersive Sky is premium. Free users who try to enter it get the
  // paywall instead — the locked mode IS the pitch.
  const enterCinematic = useCallback(() => {
    if (!gate.cinematicMode) { openPaywall(); return; }
    setCinematic(true);
  }, [gate.cinematicMode, openPaywall]);
  // Triple-tap anywhere enters cinematic Immersive Sky. Runs alongside pinch so zoom
  // still works; single taps fall through to the object hit-targets as before.
  const cinematicTap = useMemo(
    () => Gesture.Tap().numberOfTaps(3).runOnJS(true).onEnd(() => enterCinematic()),
    [enterCinematic]
  );
  const sceneGesture = useMemo(() => Gesture.Simultaneous(pinch, cinematicTap), [pinch, cinematicTap]);
  const fov = useMemo(
    () => ({
      horizontalDegrees: DEFAULT_FOV.horizontalDegrees / zoom,
      verticalDegrees: DEFAULT_FOV.verticalDegrees / zoom
    }),
    [zoom]
  );
  const cameraZoom = Math.min(0.5, (zoom - 1) * 0.05);
  // Milky Way brightens as the camera fades out: faint over a live feed, bold over
  // black. AR (1.4) → Immersive (1.9) → Planetarium (2.4).
  // ── Sky Quality (Bortle) + live conditions drive the entire visual ─────────
  // Lightweight weather snapshot (cloud cover) feeds the magnificent-night boost.
  const [weather, setWeather] = useState<WeatherSnapshot>({
    cloudPercent: 30, humidity: 50, tempCelsius: 20, description: "loading…", source: "unavailable",
  });
  useEffect(() => {
    fetchCurrentWeather(location).then(setWeather).catch(() => {});
  }, [location]);
  // 1. BORTLE PRESET — the profile for the user's Sky Quality setting. Drives MW
  // opacity (below), nebula opacity, and dome-star count (both in SkyLensCanvas).
  const skyProfile = SKY_PROFILES[settings.skyQuality as SkyQuality] ?? SKY_PROFILES.dark;
  // 3. MAGNIFICENT NIGHT — a great Stargazing Index (>85) blazes the MW + nebulae
  // 15-30% brighter. Cloud cover from the weather snapshot; seeing/transparency
  // estimated from it (same model as Home's Stargazing Index).
  const stargazingScore = useMemo(() => {
    const moonAlt = sky.bodies.find((b) => b.id === "moon")?.altitudeDegrees ?? -90;
    const cloud = weather.cloudPercent;
    const seeingArcsec = cloud > 80 ? 4.5 : cloud > 50 ? 3.2 : cloud > 20 ? 2.2 : 1.5;
    const transparencyMag = Math.max(3, 6.6 - cloud / 28);
    return computeStargazingIndex(cloud, sky.moonIlluminationPercent, moonAlt, seeingArcsec, transparencyMag).score;
  }, [sky, weather]);
  const magnificentBoost = getMagnificentBoost(stargazingScore);
  // Milky Way brightens as the camera fades out (AR 1.4 → Immersive 1.9 →
  // Planetarium 2.4), then scales by Bortle MW opacity × magnificent-night boost.
  // Free tier multiplies the whole thing by 0.4 → a faint smooth band; premium 1.0×.
  const milkyWayBoost = (planetarium ? 2.4 : cinematic ? 2.1 : immersive ? 1.9 : 1.4) * skyProfile.milkyWayOpacity * magnificentBoost * gate.milkyWayBoostMultiplier;
  // Nebula glow visibility: Bortle nebula opacity × magnificent-night boost (clamped).
  const nebulaOpacity = Math.min(1, skyProfile.nebulaOpacity * magnificentBoost);
  // 2. SEASONAL COLOR — a barely-perceptible warm (summer / MW season) or cool
  // (winter / Orion season) grade, by month + hemisphere.
  const seasonalTint = useMemo(
    () => getSeasonalTint((observerTime ?? new Date()).getMonth(), location?.latitudeDegrees ?? 0),
    [observerTime, location?.latitudeDegrees]
  );
  const cycleSkyMode = useCallback(() => {
    // Half-moon button cycles AR → Immersive → Planetarium → AR. Entering Planetarium
    // turns the Milky Way layer on. Both state updates stay at the TOP LEVEL of the
    // handler — never nest a setState inside another's updater (React runs updaters
    // during render → "Cannot update a component while rendering" throw).
    // Immersive (75% dim screenshot mode) is premium — free users skip straight
    // from AR to Planetarium and back.
    const next = skyMode === "ar"
      ? (gate.immersiveMode ? "immersive" : "planetarium")
      : skyMode === "immersive" ? "planetarium" : "ar";
    if (next === "planetarium") setActive((prev) => (prev.has("milkyway") ? prev : new Set(prev).add("milkyway")));
    setSkyMode(next);
  }, [skyMode, gate.immersiveMode]);

  const onLayout = useCallback((e: LayoutEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox({ width, height });
  }, []);

  const toggleLayer = useCallback((key: LayerKey) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // THE CONVERSION MOMENT (Paywall Strategy): when a free user taps premium content we
  // never show a bare lock — we let them EXPERIENCE the value first. Temp-enable the
  // layer for 2s (full glory), then gently fade the scene and surface "✦ Unlock the
  // living universe". Tapping the prompt opens the paywall; it auto-dismisses if ignored.
  const [preview, setPreview] = useState<{ key: LayerKey; label: string; phase: "show" | "prompt" } | null>(null);
  const previewFade = useRef(new Animated.Value(0)).current;
  const previewTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const endPreview = useCallback(() => {
    previewTimers.current.forEach(clearTimeout);
    previewTimers.current = [];
    previewFade.setValue(0);
    setPreview(null);
  }, [previewFade]);
  const startPreview = useCallback(
    (def: LayerDef) => {
      previewTimers.current.forEach(clearTimeout);
      previewTimers.current = [];
      previewFade.setValue(0);
      setPreview({ key: def.key, label: def.label, phase: "show" });
      // After 2s of full beauty, fade to the unlock prompt.
      previewTimers.current.push(
        setTimeout(() => {
          setPreview((p) => (p ? { ...p, phase: "prompt" } : null));
          Animated.timing(previewFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        }, 2000)
      );
      // Auto-dismiss if the user never taps the prompt.
      previewTimers.current.push(setTimeout(() => setPreview(null), 9000));
    },
    [previewFade]
  );
  useEffect(() => () => { previewTimers.current.forEach(clearTimeout); }, []);

  const onLockedPress = useCallback(
    (def: LayerDef) => {
      if (!isPremium) {
        // Conversion moment: preview the beauty, then prompt — never a bare lock icon.
        if (def.available) { startPreview(def); return; }
        Alert.alert(`${def.label} · Coming Soon`, `The ${def.label} layer arrives in the next Sky Lens update.`);
        return;
      }
      // Premium user, layer simply not shipped yet → informational.
      Alert.alert(`${def.label} · Coming Soon`, `The ${def.label} layer arrives in the next Sky Lens update.`);
    },
    [isPremium, startPreview]
  );

  // Layers actually rendered = the user's set, plus any premium layer being previewed.
  const activeWithPreview = useMemo(
    () => (preview ? new Set(active).add(preview.key) : active),
    [active, preview]
  );

  const onSave = useCallback(
    (object: SelectedObject) => {
      addItem({
        type: "archive",
        title: object.name,
        detail: object.description ?? object.facts.map((f) => `${f.label}: ${f.value}`).join(" · ")
      });
      setSavedIds((prev) => new Set(prev).add(object.id));
    },
    [addItem]
  );

  const hud = useMemo(
    () =>
      available
        ? `Heading ${Math.round(pointing.azimuthDegrees)}°  ·  Alt ${Math.round(pointing.altitudeDegrees)}°`
        : "Calibrating compass…",
    [available, pointing.azimuthDegrees, pointing.altitudeDegrees]
  );

  // Moon finder: tells you where the Moon is (or that it's below the horizon) so
  // it's never a mystery why you can't see it.
  const moonFinder = useMemo(() => {
    const moon = sky.bodies.find((b) => b.id === "moon");
    if (!moon) return null;
    if (!moon.aboveHorizon) return "☾  The Moon is below the horizon right now";
    const p = projectTarget(pointing, moon.azimuthDegrees, moon.altitudeDegrees, fov, box);
    if (p.onScreen) return null; // it's in view — no need to point you to it
    return p.behind ? "☾  Turn around for the Moon ↻" : `☾  Pan ${arrowFor(p.bearingDegrees)} to the Moon`;
  }, [sky.bodies, pointing, box, fov]);

  // ── Find Mode: guide the user to a target handed in from a Learn lesson ──────
  const targetHoriz = useMemo(() => {
    if (!focusTarget) return null;
    const obs = new Observer(location.latitudeDegrees, location.longitudeDegrees, location.altitudeMeters ?? 0);
    const h = Horizon(sky.when, obs, focusTarget.raHours, focusTarget.decDegrees, "normal");
    return { az: h.azimuth, alt: h.altitude, above: h.altitude > 0 };
  }, [focusTarget, location, sky.when]);

  const targetProj = useMemo(() => {
    if (!targetHoriz || !targetHoriz.above) return null;
    return projectTarget(pointing, targetHoriz.az, targetHoriz.alt, fov, box);
  }, [targetHoriz, pointing, fov, box]);

  const targetFinder = useMemo(() => {
    if (!focusTarget || !targetHoriz) return null;
    if (!targetHoriz.above) return `✦  ${focusTarget.name} is below the horizon right now`;
    if (!targetProj || targetProj.onScreen) return null;
    return targetProj.behind
      ? `✦  Turn around for ${focusTarget.name} ↻`
      : `✦  Pan ${arrowFor(targetProj.bearingDegrees)} to ${focusTarget.name}`;
  }, [focusTarget, targetHoriz, targetProj]);

  // On arrival (target first comes on screen), slide up the lesson info card once.
  const arrivedRef = useRef(false);
  useEffect(() => {
    arrivedRef.current = false;
  }, [focusTarget]);
  useEffect(() => {
    if (focusTarget && targetHoriz?.above && targetProj?.onScreen && !arrivedRef.current) {
      arrivedRef.current = true;
      setSelected({
        kind: "constellation",
        id: `focus-${focusTarget.name}`,
        name: focusTarget.name,
        subtitle: focusTarget.subtitle,
        facts: [
          { label: "Azimuth", value: `${Math.round(targetHoriz.az)}°` },
          { label: "Altitude", value: `${Math.round(targetHoriz.alt)}°` },
        ],
        description: focusTarget.description,
      });
    }
  }, [focusTarget, targetHoriz, targetProj]);

  // Dynamic sky gradient by the Sun's altitude (drives Planetarium Mode's backdrop).
  const sunAltitude = sky.bodies.find((b) => b.id === "sun")?.altitudeDegrees ?? -90;
  const skyColors = skyGradient(sunAltitude);

  // The 20 brightest on-screen stars projected for the twinkle overlay (View-based,
  // crash-safe). Sorted by magnitude so it's genuinely the brightest, not the first
  // 20 found in catalog order.
  const twinkleStars = useMemo<TwinkleTarget[]>(() => {
    const out: TwinkleTarget[] = [];
    for (const s of sky.stars) {
      if (!s.aboveHorizon || s.magnitude > 3.0) continue;
      const p = projectTarget(pointing, s.azimuthDegrees, s.altitudeDegrees, fov, box);
      if (!p.onScreen) continue;
      out.push({
        id: s.id,
        x: p.x,
        y: p.y,
        size: Math.max(2.5, 6 - s.magnitude),
        color: starColor(s.id, s.magnitude),
        offset: (s.id.charCodeAt(0) % 10) / 10,
        magnitude: s.magnitude
      });
    }
    return out.sort((a, b) => a.magnitude - b.magnitude).slice(0, 10);
  }, [sky.stars, pointing, fov, box]);

  const accent = nightMode ? "#C24A4A" : AuraLunisColors.gold;

  // Hero Object Spotlight: reverse-map the selected object's id to its LIVE az/alt
  // (one place, no per-layer wiring), then project it so the spotlight dims the
  // field around whatever you've focused and tracks it as you pan.
  const focusAzAlt = useMemo(() => {
    if (!selected) return null;
    const { kind, id } = selected;
    if (kind === "moon" || kind === "planet") {
      const b = sky.bodies.find((x) => x.id === id);
      return b && b.aboveHorizon ? { az: b.azimuthDegrees, alt: b.altitudeDegrees } : null;
    }
    if (kind === "star") {
      const s = sky.stars.find((x) => x.id === id) ?? sky.domeStars.find((x) => x.id === id);
      return s && s.aboveHorizon ? { az: s.azimuthDegrees, alt: s.altitudeDegrees } : null;
    }
    if (kind === "constellation") {
      const c = sky.constellations.find((x) => x.id === id);
      return c ? { az: c.centroid.azimuthDegrees, alt: c.centroid.altitudeDegrees } : null;
    }
    if (kind === "nebula") {
      const n = sky.nebulae.find((x) => x.id === id);
      return n && n.aboveHorizon ? { az: n.azimuthDegrees, alt: n.altitudeDegrees } : null;
    }
    if (kind === "zodiac") {
      const z = sky.zodiac.signs.find((s) => `zodiac-${s.id}` === id);
      return z && z.center.aboveHorizon ? { az: z.center.azimuthDegrees, alt: z.center.altitudeDegrees } : null;
    }
    return null;
  }, [selected, sky]);

  const focusProj = useMemo(() => {
    if (!focusAzAlt) return null;
    const p = projectTarget(pointing, focusAzAlt.az, focusAzAlt.alt, fov, box);
    return p.behind ? null : p;
  }, [focusAzAlt, pointing, fov, box]);

  // Focus zone handed to the canvas layers: the selected object's on-screen point +
  // a boost radius. Layers swell/brighten nebulae and stars that fall inside it, so
  // the spotlighted region literally intensifies (not just dims around it).
  const focusZone = useMemo<FocusZone>(() => {
    if (!focusProj || !focusProj.onScreen) return null;
    return { x: focusProj.x, y: focusProj.y, r: Math.min(box.width, box.height) * 0.34 };
  }, [focusProj, box]);

  // Permanent HERO REGIONS — focal zones where everything reinforces, so the sky isn't
  // uniformly bright. When a hero's anchor is in view, the whole region lights up (no
  // tap): layers boost nebula intensity (~3×), local star density, and showcase-star
  // glow inside the zone. Sagittarius is THE showpiece (largest zone) — Lagoon + Trifid
  // + Swan + Eagle + the galactic core all overlap → "Whoa." Then Orion (winter), then
  // Carina (southern). First anchor that's on-screen wins; Sagittarius is checked first.
  const HERO_REGIONS: ReadonlyArray<{ id: string; r: number }> = [
    { id: "m8", r: 0.66 },     // Sagittarius core — showpiece, widest zone
    { id: "m42", r: 0.55 },    // Orion
    { id: "ngc3372", r: 0.5 }, // Carina
  ];
  const showcaseZone = useMemo<FocusZone>(() => {
    for (const hero of HERO_REGIONS) {
      const n = sky.nebulae.find((x) => x.id === hero.id);
      if (!n || !n.aboveHorizon) continue;
      const sp = projectTarget(pointing, n.azimuthDegrees, n.altitudeDegrees, fov, box);
      if (sp.behind || !sp.onScreen) continue;
      return { x: sp.x, y: sp.y, r: Math.min(box.width, box.height) * hero.r };
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sky.nebulae, pointing, fov, box]);

  // Below-horizon bleed guard: the screen-fixed decorative overlays (FX layers,
  // atmosphere glow, meteors) aren't sky-projected, so they'd render over the real
  // floor in camera mode. Fade them out as the camera tilts below the horizon —
  // 1 at alt ≥ 0°, linearly to 0 by −18°. Planetarium (virtual dome) keeps full.
  const horizonFade = planetarium ? 1 : Math.max(0, Math.min(1, (pointing.altitudeDegrees + 18) / 18));

  // Moon screen position for the Lunar God Ray layer.
  const moonProj = useMemo(() => {
    const m = sky.bodies.find((b) => b.id === "moon");
    if (!m || !m.aboveHorizon) return null;
    const mp = projectTarget(pointing, m.azimuthDegrees, m.altitudeDegrees, fov, box);
    return mp.behind ? null : mp;
  }, [sky.bodies, pointing, fov, box]);

  // Constellation Forge: when a constellation is identified (selected), snapshot its
  // projected segments/points and play the gold ink-draw for ~1.8s.
  const [forge, setForge] = useState<{ active: boolean; points: ForgePoint[]; segments: ForgeSegment[] }>(
    { active: false, points: [], segments: [] }
  );
  const forgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (selected?.kind !== "constellation") return;
    const c = sky.constellations.find((x) => x.id === selected.id);
    if (!c) return;
    const proj = c.points.map((pt) => projectTarget(pointing, pt.azimuthDegrees, pt.altitudeDegrees, fov, box));
    const points: ForgePoint[] = proj.filter((q) => !q.behind).map((q) => ({ x: q.x, y: q.y }));
    const segments: ForgeSegment[] = c.lines
      .filter(([i, j]) => proj[i] && proj[j] && !proj[i].behind && !proj[j].behind)
      .map(([i, j]) => ({ from: { x: proj[i].x, y: proj[i].y }, to: { x: proj[j].x, y: proj[j].y } }));
    setForge({ active: true, points, segments });
    if (forgeTimer.current) clearTimeout(forgeTimer.current);
    forgeTimer.current = setTimeout(() => setForge((f) => ({ ...f, active: false })), 1900);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, selected?.kind]);
  useEffect(() => () => { if (forgeTimer.current) clearTimeout(forgeTimer.current); }, []);

  // Apple-delight haptics (HapticDiscoveryService): a soft pulse when you tap an object,
  // and a whisper the first time a hero object drifts into the centre of the view.
  useEffect(() => {
    if (selected?.id) onObjectTapped(selected.id);
  }, [selected?.id]);
  const heroCenteredRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const cx = box.width / 2, cy = box.height / 2;
    const rad = Math.min(box.width, box.height) * 0.22; // ≈ the centre 30° of the view
    const now = new Set<string>();
    const check = (id: string, az: number, alt: number) => {
      const p = projectTarget(pointing, az, alt, fov, box);
      if (p.behind || !p.onScreen) return;
      if (Math.hypot(p.x - cx, p.y - cy) <= rad) {
        now.add(id);
        if (!heroCenteredRef.current.has(id)) onObjectCentered(id); // service dedupes + cools down
      }
    };
    for (const b of sky.bodies) if (b.aboveHorizon && b.id !== "sun") check(b.id, b.azimuthDegrees, b.altitudeDegrees);
    for (const s of sky.stars) if (s.aboveHorizon && s.magnitude < 1.3) check(s.id, s.azimuthDegrees, s.altitudeDegrees);
    heroCenteredRef.current = now;
  }, [pointing, sky.bodies, sky.stars, fov, box]);

  return (
    <View style={styles.root} onLayout={onLayout}>
      <GestureDetector gesture={sceneGesture}>
        <View ref={sceneRef} collapsable={false} style={StyleSheet.absoluteFill}>
          {/* Planetarium Mode = camera off → the living atmospheric sky fills the screen */}
          {!planetarium && <CameraView style={StyleSheet.absoluteFillObject} facing="back" zoom={cameraZoom} />}

          {/* Cosmic dark overlay */}
          <View
            style={[StyleSheet.absoluteFillObject, {
              backgroundColor: planetarium
                ? "rgba(3,8,22,0.95)"
                : cinematic
                ? "rgba(3,8,22,0.85)"
                : immersive
                ? "rgba(3,8,22,0.75)"
                : "rgba(3,8,22,0.45)",
            }]}
            pointerEvents="none"
          />
          {planetarium && !nightMode && (
            <LinearGradient
              colors={skyColors}
              locations={[0, 0.42, 0.72, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={[StyleSheet.absoluteFillObject, { opacity: horizonFade }]}
              pointerEvents="none"
            />
          )}
          {/* Atmospheric depth over the camera feed: transparent at the top,
              deepening to ground-glow at the bottom for a sense of depth. */}
          {!nightMode && !planetarium && (
            <LinearGradient
              colors={["rgba(8,16,42,0)", "rgba(9,18,47,0.1)", "rgba(10,20,50,0.3)", "rgba(10,21,53,0.55)"] as const}
              locations={[0, 0.42, 0.74, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
          )}
          {nightMode && <View style={styles.nightFilter} pointerEvents="none" />}

          {/* Ambient atmosphere (Gemini's refined pair): breathing sky bloom +
              shimmering luxury starfield, above the background and below the star
              canvas + labels/cards. Crash-safe (Animated.View + useAnimatedStyle). */}
          <PremiumSkyBloomLayer
            width={box.width}
            height={box.height}
            nightVision={nightMode}
            moonVisible={sky.bodies.find((b) => b.id === "moon")?.aboveHorizon ?? false}
            milkyWayVisible={active.has("milkyway")}
            intensity={(planetarium ? 0.9 : 0.55) * horizonFade}
          />
          {/* AstralBreathingLayer — re-enabled at LOW intensity (Path-to-10 §6): a
              barely-perceptible 22s breathing swell so the sky feels alive, not static.
              Crash-safe (single Animated.View + useAnimatedStyle over a static Svg).
              Faded out below the horizon with the other screen-fixed FX. */}
          <AstralBreathingLayer
            width={box.width}
            height={box.height}
            nightVision={nightMode}
            intensity={(planetarium ? 0.55 : 0.4) * horizonFade}
          />
          {/* LuxuryStarfieldFXLayer disabled — 110 particles + shimmer animation
              is expensive. Re-enable when performance budget allows. */}
          {moonProj && (
            <LunarGodRayLayer
              width={box.width}
              height={box.height}
              moonX={moonProj.x}
              moonY={moonProj.y}
              moonRadius={22}
              visible={moonProj.onScreen}
              nightVision={nightMode}
              intensity={(planetarium ? 0.9 : 0.5) * horizonFade}
            />
          )}
          <OrbitalGhostTrailsLayer
            width={box.width}
            height={box.height}
            trails={[]}
            nightVision={nightMode}
            intensity={(planetarium ? 0.9 : 0.6) * horizonFade}
          />

          {/* Aurora curtains — soft atmospheric light BEHIND the sky objects (this
              sits above the background FX, below the star canvas + labels/cards, and
              is pointerEvents="none"). v1 shows it only in Planetarium ("fantasy /
              preview") mode; realistic camera mode stays off until an enable toggle /
              live AuroraForecastService gate is wired. */}
          <AuroraCurtainLayer
            width={box.width}
            height={box.height}
            visible={planetarium}
            intensity={0.55}
            variant="cosmic"
            nightVision={nightMode}
          />

          <SkyLensErrorBoundary>
            <SkyLensCanvas
              box={box}
              pointing={pointing}
              sky={sky}
              fov={fov}
              activeLayers={activeWithPreview}
              nightMode={nightMode}
              milkyWayBoost={milkyWayBoost}
              gate={gate}
              domeStarMultiplier={skyProfile.domeStarMultiplier}
              nebulaOpacity={nebulaOpacity}
              extinction={!nightMode}
              isPremium={isPremium}
              focus={focusZone}
              showcase={showcaseZone}
              parallax={parallax}
              satellites={satellites}
              cinematic={cinematic}
              onSelect={setSelected}
            />
          </SkyLensErrorBoundary>
          {/* 2. SEASONAL COLOR — a whisper of warm (summer / MW season) or cool
              (winter / Orion season) grade over the sky. pointerEvents none so it
              never blocks taps; opacity ≤8% so it's felt, not seen. */}
          {seasonalTint.warm > 0 && (
            <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: `rgba(217,168,78,${seasonalTint.warm})` }]} />
          )}
          {seasonalTint.cool > 0 && (
            <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: `rgba(100,140,220,${seasonalTint.cool})` }]} />
          )}
          {/* Crash-safe twinkle: View-opacity animation over the bright stars */}
          <TwinkleOverlay targets={twinkleStars} nightMode={nightMode} />
          {/* Shooting stars now live in ShootingStarLayer (inside SkyLensCanvas):
              moving head + trailing tail, 8-12 min schedule, its own haptic pulse.
              The old View-based MeteorOverlay was retired to avoid two meteor
              systems firing on different clocks + double haptics. */}
          {/* Find-Mode arrival pulse on the lesson target */}
          {targetProj?.onScreen && <TargetPulse x={targetProj.x} y={targetProj.y} />}
          {/* Hero Object Spotlight — dims the field around the selected object so it
              becomes the star of the scene. Above the field, below the forge + HUD. */}
          {focusProj && <HeroSpotlight x={focusProj.x} y={focusProj.y} box={box} nightMode={nightMode} />}
          {/* Constellation Forge — gold ink-draw on identify (above canvas, below HUD) */}
          <ConstellationForgeLayer
            width={box.width}
            height={box.height}
            active={forge.active}
            points={forge.points}
            segments={forge.segments}
            nightVision={nightMode}
          />
          {/* Watermark — baked into the captured photo only (mounts during capture) */}
          {capturing && (
            <View style={[styles.watermark, { bottom: insets.bottom + 16 }]} pointerEvents="none">
              <Text style={styles.watermarkBrand}>✦ AuraLunis</Text>
              <Text style={styles.watermarkSub}>
                {(observerTime ?? new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </Text>
            </View>
          )}
        </View>
      </GestureDetector>

      {/* Cinematic Immersive Sky — a single tap anywhere restores the UI. Mounted only
          in cinematic, above the scene, so the sky stays pristine and the exit gesture
          is captured cleanly. A brief auto-fading hint makes it discoverable. */}
      {cinematic && (
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setCinematic(false)}>
          <Animated.View
            style={[styles.cinematicHint, { bottom: insets.bottom + 44, opacity: cinematicHint }]}
            pointerEvents="none"
          >
            <Text style={styles.cinematicHintText}>✦  Tap anywhere to show controls</Text>
          </Animated.View>
        </Pressable>
      )}

      {/* Capture flash — white pulse over the scene (View opacity, crash-safe) */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: "#FFFFFF", opacity: flash }]}
        pointerEvents="none"
      />

      {/* Zoom indicator — pinch to zoom, tap to reset */}
      {!cinematic && zoom > 1.05 && (
        <TouchableOpacity
          style={[styles.zoomChip, { top: insets.top + 58 }]}
          onPress={() => setZoom(1)}
          activeOpacity={0.85}
        >
          <Text style={[styles.zoomText, { color: accent }]}>{zoom.toFixed(1)}×  ·  tap to reset</Text>
        </TouchableOpacity>
      )}

      {/* Top HUD (hidden in cinematic Immersive Sky) */}
      {!cinematic && (
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <TouchableOpacity style={styles.iconBtn} onPress={onClose} activeOpacity={0.8}>
          <Text style={styles.iconBtnText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.hudPill} pointerEvents="none">
          <Text style={[styles.hudText, { color: accent }]}>{hud}</Text>
          {planetarium ? (
            <Text style={styles.hudSub}>🔭 Planetarium — pan to explore</Text>
          ) : immersive ? (
            <Text style={styles.hudSub}>🌌 Immersive — dimmed for photos</Text>
          ) : status === "fallback" ? (
            <Text style={styles.hudSub}>Default location</Text>
          ) : null}
        </View>

        <View style={styles.toggleRow} pointerEvents="box-none">
          <TouchableOpacity
            style={[styles.iconBtn, scrubVisible && { backgroundColor: "rgba(217,168,78,0.32)" }]}
            onPress={() => {
              // Hiding the bar snaps back to the live sky so we never leave it frozen.
              if (scrubVisible && timeOffsetMin !== 0) setTimeOffsetMin(0);
              setScrubVisible((v) => !v);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.iconBtnText}>🕐</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, skyMode !== "ar" && { backgroundColor: "rgba(217,168,78,0.32)" }]}
            onPress={cycleSkyMode}
            onLongPress={enterCinematic}
            delayLongPress={400}
            activeOpacity={0.8}
          >
            <Text style={styles.iconBtnText}>{planetarium ? "🔭" : immersive ? "🌌" : "📷"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, nightMode && { backgroundColor: "rgba(139,32,32,0.5)" }]}
            onPress={() => {
              if (!gate.nightVision) { openPaywall(); return; } // red dark-adapt mode is premium
              const next = !nightMode; setNightMode(next); updateSetting("nightVision", next);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.iconBtnText}>{nightMode ? "🌙" : "◐"}</Text>
          </TouchableOpacity>
        </View>
      </View>
      )}

      {/* Find-Mode target banner (from a Learn lesson) takes priority */}
      {!cinematic && !selected && targetFinder && (
        <View style={[styles.finder, { bottom: insets.bottom + 82 }]} pointerEvents="none">
          <Text style={[styles.finderText, { color: accent }]}>{targetFinder}</Text>
        </View>
      )}
      {/* Moon finder banner (hidden while an info card is open or a target is set) */}
      {!cinematic && !selected && !targetFinder && moonFinder && (
        <View style={[styles.finder, { bottom: insets.bottom + 82 }]} pointerEvents="none">
          <Text style={[styles.finderText, { color: accent }]}>{moonFinder}</Text>
        </View>
      )}

      {/* Photo shutter — capture the sky + overlay, baked with watermark, to share.
          Premium only (gate.photoCapture). */}
      {!cinematic && !selected && gate.photoCapture && (
        <TouchableOpacity
          style={[styles.shutterBtn, { bottom: insets.bottom + 168, borderColor: accent }]}
          onPress={captureSky}
          disabled={capturing}
          activeOpacity={0.8}
        >
          <Text style={styles.shutterIcon}>{capturing ? "…" : "📷"}</Text>
        </TouchableOpacity>
      )}

      {/* Bottom controls (hidden in cinematic Immersive Sky) */}
      {!cinematic && (
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 6 }]} pointerEvents="box-none">
        {/* Time Scrub — drag to fast-forward / rewind the whole sky */}
        {scrubVisible && !selected && (
          <View style={{ marginBottom: 10 }}>
            <TimeScrubBar offsetMinutes={timeOffsetMin} onChange={setTimeOffsetMin} accent={accent} />
          </View>
        )}
        {selected ? (
          <SkyLensInfoCard
            object={selected}
            nightMode={nightMode}
            saved={savedIds.has(selected.id)}
            onSave={onSave}
            onClose={() => setSelected(null)}
          />
        ) : (
          <SkyLensLayerBar
            active={active}
            isPremium={isPremium}
            nightMode={nightMode}
            onToggle={toggleLayer}
            onLockedPress={onLockedPress}
          />
        )}
      </View>
      )}

      {/* THE CONVERSION MOMENT — after a 2s preview of the premium beauty, the scene
          gently fades and the unlock prompt rises. Tap anywhere on it → the paywall. */}
      {preview?.phase === "prompt" && (
        <Pressable style={StyleSheet.absoluteFill} onPress={() => { endPreview(); openPaywall(); }}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.previewScrim, { opacity: previewFade }]} pointerEvents="none" />
          <Animated.View style={[styles.previewPrompt, { bottom: insets.bottom + 132, opacity: previewFade }]} pointerEvents="none">
            <Text style={styles.previewTitle}>✦ Unlock the living universe</Text>
            <Text style={styles.previewSub}>Tap to see {preview.label} like never before</Text>
          </Animated.View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  nightFilter: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },
  atmosphere: { position: "absolute", left: 0, right: 0, bottom: 0, height: "42%" },
  zoomChip: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "rgba(7,18,37,0.78)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6
  },
  zoomText: { fontSize: 12, fontWeight: "800", fontVariant: ["tabular-nums"] },
  toggleRow: { flexDirection: "row", gap: 8 },
  shutterBtn: {
    position: "absolute",
    right: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    backgroundColor: "rgba(7,10,19,0.75)",
    alignItems: "center",
    justifyContent: "center"
  },
  shutterIcon: { fontSize: 26 },
  watermark: { position: "absolute", left: 18, alignItems: "flex-start" },
  watermarkBrand: { color: "#F4E3B8", fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },
  watermarkSub: { color: "rgba(244,227,184,0.75)", fontSize: 11, fontWeight: "600", marginTop: 1 },
  finder: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  finderText: {
    backgroundColor: "rgba(7,18,37,0.78)",
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    overflow: "hidden"
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(7,18,37,0.8)",
    borderWidth: 1,
    borderColor: "rgba(217,168,78,0.34)",
    alignItems: "center",
    justifyContent: "center"
  },
  iconBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  hudPill: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "rgba(7,18,37,0.6)",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center"
  },
  previewScrim: { backgroundColor: "rgba(3,8,22,0.5)" },
  previewPrompt: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  previewTitle: {
    color: "#F4E3B8",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 8,
  },
  previewSub: {
    color: "rgba(244,227,184,0.82)",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
  },
  cinematicHint: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  cinematicHintText: {
    color: "rgba(244,227,184,0.92)",
    backgroundColor: "rgba(7,18,37,0.55)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: "hidden",
  },
  hudText: { fontSize: 13, fontWeight: "900", fontVariant: ["tabular-nums"] },
  hudSub: { color: AuraLunisColors.muted, fontSize: 10, marginTop: 1 },
  bottom: { position: "absolute", left: 0, right: 0, bottom: 0 }
});
