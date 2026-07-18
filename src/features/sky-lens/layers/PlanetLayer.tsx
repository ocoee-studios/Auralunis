import React from "react";
import { Circle, Defs, G, RadialGradient, Stop, Text as SvgText } from "react-native-svg";
import type { SkyBody } from "../ephemeris/SkyEphemerisService";
import { PLANET_COLORS, type ProjectFn, type SkyPalette, type SelectedObject } from "../SkyLensVisual";
import type { LabelPlacer } from "../labelLayout";
import { renderPlanetIllustration } from "./PlanetIllustrations";

type Props = {
  bodies: SkyBody[];
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
  placeLabel?: LabelPlacer;
  showLabels?: boolean;
  /** Labels-only pass: reserve discs + place labels (mount BEFORE StarLayer), no artwork. */
  labelsOnly?: boolean;
  useIllustrations?: boolean;
  zoom?: number;
  fullSphere?: boolean;
  onSelect: (object: SelectedObject) => void;
};

const PLANET_IDS = new Set(["mercury", "venus", "mars", "jupiter", "saturn"]);

// Restrained planet radii for a wide-field planetarium. The illustrations remain
// recognizable, but no object should dominate the full Sky Lens viewport.
//
// DEVICE-REVIEW CORRECTION: the previous pass pushed the discs too far and Jupiter,
// Venus and the Moon read as cartoon stickers. Discs come back down hard; the GLOW does
// the "this is a planet, not a star" work, because a soft halo reads as brightness while
// a fat disc just reads as a decal. Discs shrink more than glows do.
//
//   jupiter −24%   venus −20%   saturn −21%   mercury −15%   mars −8%
//
// Saturn was NOT in the brief, but it had to come down with Jupiter: cutting Jupiter 24%
// alone would have left Saturn rendering LARGER than Jupiter, inverting the one size
// relationship every stargazer already knows. Hierarchy preserved:
//   jupiter 14.5 > saturn 13.5 > venus 12 = mars 12 > mercury 6.8
const STYLE: Record<string, { disc: number; glow: number }> = {
  mercury: { disc: 6.8, glow: 14.5 }, // still the shy one — findable, never showy
  venus: { disc: 12, glow: 28 }, // brightest after the Moon: smallest disc, biggest glow
  mars: { disc: 12, glow: 26 }, // barely touched — it was reading correctly
  jupiter: { disc: 14.5, glow: 26.5 },
  saturn: { disc: 13.5, glow: 25.5 },
};

// Each planet gets its OWN halo colour. Previously every planet shared a single gold
// bloom, which is why Mars never read as red and why nothing separated from the star
// field. Colouring the halo is the single biggest legibility win here — Mars now sits
// in a warm rust glow, Venus in a cold platinum one, and the eye sorts them instantly.
const HALO: Record<string, string> = {
  mercury: "#C0C6D4",
  venus: "#FFFBEA",
  mars: "#FF5E2C",
  jupiter: "#EF9F27",
  saturn: "#D9A84E",
};

export function PlanetLayer({
  bodies,
  project,
  palette,
  nightMode,
  placeLabel,
  showLabels = true,
  labelsOnly = false,
  useIllustrations = true,
  zoom = 1,
  onSelect,
}: Props) {
  // Floor lifted 0.9 → 1.0: at rest (zoom = 1) planets were rendering at 90% of their
  // nominal size, which is where a lot of the "planets get lost" problem came from.
  const planetScale = Math.min(1.45, Math.max(1.0, 1.0 + (zoom - 1) * 0.12));

  // PRE-PASS. Project every visible planet and CLAIM ITS ARTWORK in the shared label
  // placer before a single label is placed. Without this, planet labels are placed in
  // body order, so Jupiter's label could be dropped straight on top of Saturn's disc —
  // the placer only knew about other LABELS, never about artwork. Projection is
  // identical to before; this just runs it once up front instead of inside the map.
  const visible = bodies
    .filter((body) => PLANET_IDS.has(body.id) && body.aboveHorizon)
    .map((body) => {
      // POSITION IS SACRED. This call and the x/y it yields are untouched by this pass —
      // every change in this file is radius, colour, opacity or label layout.
      const point = project(body.azimuthDegrees, body.altitudeDegrees);
      if (!point.onScreen) return null;
      const style = STYLE[body.id] ?? { disc: 8, glow: 14 };
      return { body, point, disc: style.disc * planetScale, glow: style.glow * planetScale };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  // Reserve planet DISCS in the shared placer. Done in the labelsOnly / full pass so it
  // runs BEFORE StarLayer places star labels (see the canvas), which is what lets a nearby
  // star label yield to a planet.
  if (placeLabel && (labelsOnly || showLabels)) {
    for (const v of visible) {
      // Reserve the DISC (plus a hair), not the whole glow — reserving the full halo
      // would be so greedy it would shove every nearby star label off screen.
      placeLabel.reserveCircle(v.point.x, v.point.y, v.disc * 1.15);
    }
  }

  // A planet's NAME, placed through the shared placer. PRIORITY 1: never dropped — if the
  // placer finds no clean slot it falls back to the natural position rather than vanishing.
  // Because planet labels now CLAIM before star labels (labelsOnly pass mounts first), a
  // nearby named star (e.g. Aldebaran by Mars) yields its slot to the planet instead.
  const renderLabel = (v: (typeof visible)[number]) => {
    const { body, point, glow, disc } = v;
    const { x, y } = point;
    // Saturn's rings reach well past its glow (aRx ≈ 2×disc); push its label clear of the
    // ring tips so the planet and its name breathe. Every other planet keeps the original
    // spacing. This only shifts the label's starting slot — positions are untouched.
    const ringReach = body.id === "saturn" ? disc * 2.0 : 0;
    const reach = Math.max(glow * 0.8, ringReach);
    const avoid = { x, y, r: reach };
    const fallbackX = x + reach + (body.id === "saturn" ? 12 : 6);
    const placed = placeLabel ? placeLabel(fallbackX, y + 4, body.name, 17, avoid, false, { weight: 700 }) : null;
    const labelPoint = placed && Number.isFinite(placed.x) ? placed : { x: fallbackX, y: y + 4 };
    return (
      <G key={`${body.id}-label`}>
        {/* Outline + fill: legible over a bright nebula or the Milky Way without a plate. */}
        <SvgText x={labelPoint.x} y={labelPoint.y} fill="none" stroke="#050914" strokeWidth={2.2} strokeOpacity={0.5} fontSize={17} fontWeight="700">
          {body.name}
        </SvgText>
        <SvgText x={labelPoint.x} y={labelPoint.y} fill={palette.starLabel} fontSize={17} fontWeight="700" opacity={0.96}>
          {body.name}
        </SvgText>
      </G>
    );
  };

  // LABELS-ONLY pass: reserve discs (above) + claim/render labels. Mounted BEFORE StarLayer
  // so planet names outrank star names in the placer. No artwork here.
  if (labelsOnly) {
    return <G>{visible.map((v) => renderLabel(v))}</G>;
  }

  return (
    <G>
      <Defs>
        {/* Per-planet halos, built from HALO above. */}
        {/* Planets are the RICH tier of the glow hierarchy: not as crisp as a bright star,
            never as diffuse as a nebula. Their halo holds more colour deeper in (26% →
            34% at the inner stop) so the light feels SOLID and saturated around the disc
            rather than thinning immediately into haze. Radii are unchanged — this is
            density, not size. */}
        {Object.entries(HALO).map(([id, hue]) => (
          <RadialGradient key={id} id={`planetHalo-${id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.34} />
            <Stop offset="24%" stopColor={hue} stopOpacity={0.34} />
            <Stop offset="52%" stopColor={hue} stopOpacity={0.14} />
            <Stop offset="100%" stopColor={hue} stopOpacity={0} />
          </RadialGradient>
        ))}
        {/* Night Mode keeps the flat-red discipline — one red halo, no colour. */}
        <RadialGradient id="planetHaloNight" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={palette.accent} stopOpacity={0.2} />
          <Stop offset="55%" stopColor={palette.accent} stopOpacity={0.07} />
          <Stop offset="100%" stopColor={palette.accent} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {visible.map(({ body, point, disc, glow }) => {
        const color = nightMode ? palette.accent : PLANET_COLORS[body.id] ?? palette.accent;
        const haloId = nightMode ? "planetHaloNight" : `planetHalo-${body.id}`;
        const { x, y } = point;

        const onPress = () => {
          onSelect({
            kind: "planet",
            id: body.id,
            name: body.name,
            subtitle: "Planet",
            facts: [
              ...(body.magnitude !== undefined
                ? [{ label: "Magnitude", value: body.magnitude.toFixed(1) }]
                : []),
              { label: "Azimuth", value: `${Math.round(body.azimuthDegrees)}°` },
              { label: "Altitude", value: `${Math.round(body.altitudeDegrees)}°` },
            ],
          });
        };

        return (
          <G key={body.id}>
            {/* Two-stage halo: a wide, very faint outer wash that lifts the planet off
                the star field, then a tighter, brighter inner bloom that gives it the
                "burning" quality a bright planet actually has to the naked eye. */}
            <Circle cx={x} cy={y} r={glow * 1.5} fill={`url(#${haloId})`} opacity={nightMode ? 0.1 : 0.28} />
            <Circle cx={x} cy={y} r={glow} fill={`url(#${haloId})`} opacity={nightMode ? 0.2 : 0.82} />
            {/* A tight inner bloom hugging the disc. This is what reads as SOLIDITY — the
                planet sits in a dense pool of its own light instead of fading straight out
                into a wide soft wash. It's also what separates a planet from a bright star
                at a glance: the star's halo is crisp and thin, the planet's is deep. */}
            {!nightMode && (
              <Circle cx={x} cy={y} r={disc * 1.75} fill={`url(#${haloId})`} opacity={0.55} />
            )}

            {/* Saturn's ring system is drawn inside SaturnIllustration now (tilt, ring
                shadow on the globe, Cassini division, near-side pass-in-front) — the old
                duplicate ring ellipses that used to live here were removed so the rings
                aren't drawn twice. */}
            {(() => {
              if (useIllustrations) {
                // POSITION IS SACRED: x, y, disc come straight from the projection above.
                // Only ephemeris-derived phase (Venus) and cap gating (Mars) are passed in.
                const illustration = renderPlanetIllustration(body.id, x, y, disc, nightMode, {
                  illumination: body.illuminationFraction
                });
                if (illustration) return illustration;
              }
              return <Circle cx={x} cy={y} r={disc} fill={color} />;
            })()}

            {/* Specular highlight, softened 0.42 → 0.26. A hard white dot on a small disc
                is a big part of what read as "cartoon sticker" on device. Suppressed for
                Venus, whose phase artwork owns its own shading — a highlight could otherwise
                land on the unlit limb. */}
            {!nightMode && body.id !== "venus" && (
              <Circle
                cx={x - disc * 0.3}
                cy={y - disc * 0.3}
                r={Math.max(1, disc * 0.14)}
                fill="#FFFFFF"
                opacity={0.26}
              />
            )}

            <Circle cx={x} cy={y} r={Math.max(disc + 14, 24)} fill="transparent" onPress={onPress} />

            {showLabels && renderLabel({ body, point, disc, glow })}
          </G>
        );
      })}
    </G>
  );
}
