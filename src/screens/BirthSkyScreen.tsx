// BirthSkyScreen.tsx
// "What did the sky look like the night you were born?" — the most shareable
// feature in AuraLunis. Enter a birthday (+ optional time), generate the birth-sky
// profile from BirthSkyService, and share it as a "Cosmic Birth Certificate".

import React, { useEffect, useRef, useState } from "react";
import { Pressable, Share, StyleSheet, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { captureRef } from "react-native-view-shot";
import { ScreenShell } from "@/components/ScreenShell";
import { Starfield } from "@/components/Starfield";
import { BirthSkyCanvas } from "@/components/BirthSkyCanvas";
import { AuraLunisColors } from "@/theme/tokens";
import { tapLight } from "@/services/HapticService";
import { computeBirthSky, BIRTHDAY_STORAGE_KEY, type BirthSkyProfile } from "@/services/BirthSkyService";
import { useObserverLocation } from "@/features/sky-lens/ephemeris/useObserverLocation";
import { useEntitlement } from "@/hooks/useEntitlement";
import { usePaywallNavigation } from "@/context/PaywallNavigationContext";

interface Props {
  onClose: () => void;
}

// Planet tints shared with the planisphere (dot colours in the detail cards).
const PLANET_COLORS: Record<string, string> = {
  Mercury: "#C0C6D4",
  Venus: "#FFF6D6",
  Mars: "#E8836A",
  Jupiter: "#F5D08E",
  Saturn: "#E8D5A0",
  Uranus: "#8FD4D8",
  Neptune: "#6A8CE8"
};

// A one-line poetic meaning for each visible planet's presence at birth.
const PLANET_BIRTH_MEANINGS: Record<string, string> = {
  Mercury: "The messenger crossed your sky — a mind built for connection and quick thinking.",
  Venus: "The evening star was shining — beauty, harmony, and love marked your arrival.",
  Mars: "The red planet burned bright — energy, courage, and drive were written in your sky.",
  Jupiter: "The king of planets stood high — expansion, luck, and abundance welcomed you.",
  Saturn: "The ringed guardian kept watch — discipline, patience, and lasting structure shaped your moment.",
  Uranus: "The ice giant was present — originality and sudden inspiration colored your birth.",
  Neptune: "The dream planet drifted above — imagination and intuition flowed through your sky."
};

// Evocative meanings for the dominant constellation (used in the Sky Story).
const CONSTELLATION_MEANINGS: Record<string, string> = {
  Pegasus: "the winged horse, carrying dreamers beyond the horizon",
  Orion: "the great hunter, bold and unmistakable in the winter sky",
  Leo: "the lion, radiating confidence and warmth",
  Scorpius: "the scorpion, intense and transformative",
  Sagittarius: "the archer, always aiming toward something greater",
  Gemini: "the twins, bridging dualities with wit and curiosity",
  Virgo: "the maiden, grounded in precision and quiet strength",
  Aquarius: "the water bearer, pouring out ideas ahead of their time",
  Taurus: "the bull, steady and resolute under the stars",
  Cancer: "the crab, protective and deeply intuitive",
  Libra: "the scales, seeking harmony in all things",
  Pisces: "the fish, swimming between reality and imagination",
  Aries: "the ram, charging forward with unstoppable fire",
  Capricornus: "the sea-goat, climbing steadily toward the summit",
  "Ursa Major": "the great bear, a guardian circling the pole",
  "Ursa Minor": "the little bear, keeper of the constant North",
  Cassiopeia: "the queen, enthroned in the northern sky",
  Cygnus: "the swan, soaring along the river of the Milky Way",
  Lyra: "the lyre, singing the music of the spheres",
  Andromeda: "the chained princess, set forever among the stars",
  Perseus: "the hero, holding aloft the head of Medusa"
};

function article(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

function azToDir(az: number): string {
  const dirs = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"];
  return dirs[Math.round(((az % 360) + 360) % 360 / 45) % 8];
}

// Season keyword for the chart ring + story: from seasonalSky text, else birth month.
function extractSeason(profile: BirthSkyProfile): string {
  const s = (profile.seasonalSky || "").toLowerCase();
  for (const w of ["autumn", "fall", "winter", "spring", "summer"]) {
    if (s.includes(w)) return w === "fall" ? "autumn" : w;
  }
  const m = new Date(profile.birthDate).getUTCMonth() + 1; // 1–12
  if (m === 12 || m <= 2) return "winter";
  if (m <= 5) return "spring";
  if (m <= 8) return "summer";
  return "autumn";
}

// A concise poetic narrative built from the birth-sky profile.
function generateSkyStory(profile: BirthSkyProfile): string {
  const season = extractSeason(profile);
  const visible = profile.planets.filter((p) => p.visible);

  let moonPhrase: string;
  if (profile.moonIllumination > 70) moonPhrase = "beneath bright moonlight";
  else if (profile.moonIllumination < 20) moonPhrase = "beneath a dark, starlit sky";
  else moonPhrase = `with a ${profile.moonPhase.toLowerCase()} overhead`;

  let planetPhrase: string;
  if (visible.length === 0) {
    planetPhrase = "the stars held the stage";
  } else if (visible.length <= 2) {
    planetPhrase = `${visible[0].name} stood watch in the ${azToDir(visible[0].azimuth)}`;
  } else {
    planetPhrase = `${visible[0].name}, ${visible[1].name}, and ${visible[2].name} welcomed you`;
  }

  const meaning =
    CONSTELLATION_MEANINGS[profile.dominantConstellation] ??
    "an ancient pattern etched in starlight";

  const rarePhrase =
    visible.length >= 3
      ? ` An uncommon ${visible.length}-planet sky, full of possibility.`
      : "";

  return `You arrived beneath ${article(season)} ${season} sky, ${moonPhrase}. ${planetPhrase}, while ${profile.dominantConstellation} carried the night overhead — ${meaning}.${rarePhrase}`;
}

export function BirthSkyScreen({ onClose }: Props) {
  const { location, status } = useObserverLocation();
  const locationName = status === "fallback" ? "Default Location" : "Your Location";
  const { isPremium } = useEntitlement();
  const { openPaywall } = usePaywallNavigation();

  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [time, setTime] = useState(""); // HH:MM (optional)
  const [profile, setProfile] = useState<BirthSkyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<View>(null);

  // Preload the birthday saved during onboarding so the birth sky reveals immediately
  // without re-asking. Runs once on mount; location falls back to DEFAULT_OBSERVER.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(BIRTHDAY_STORAGE_KEY)
      .then((iso) => {
        if (!active || !iso) return;
        setDate(iso.slice(0, 10));
        setTime(iso.slice(11, 16));
        try {
          setProfile(computeBirthSky(iso, location, locationName));
        } catch {
          /* ignore — the user can regenerate manually */
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function generate() {
    tapLight();
    setError(null);
    const trimmed = date.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      setError("Enter your birth date as YYYY-MM-DD (e.g. 1990-06-21).");
      return;
    }
    const t = /^\d{1,2}:\d{2}$/.test(time.trim()) ? time.trim() : "12:00";
    const iso = `${trimmed}T${t.padStart(5, "0")}:00Z`;
    try {
      setProfile(computeBirthSky(iso, location, locationName));
    } catch {
      setError("Couldn't read that date. Try YYYY-MM-DD.");
    }
  }

  // Share the whole certificate as a PNG screenshot (falls back to nothing on cancel).
  async function shareBirthSky() {
    if (!profile) return;
    tapLight();
    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 1 });
      await Share.share({ url: uri });
    } catch {
      /* user cancelled or capture failed */
    }
  }

  const visiblePlanets = profile ? profile.planets.filter((p) => p.visible) : [];
  const rare = visiblePlanets.length >= 3;

  return (
    <ScreenShell title="Your Birth Sky" subtitle="Birth Sky" background={<Starfield />}>
      <Pressable style={styles.backBtn} onPress={() => { tapLight(); onClose(); }} hitSlop={12}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>

      <Text style={styles.intro}>
        The sky is different every night. Enter your birthday to reveal exactly what was overhead the moment you arrived.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>BIRTH DATE</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={AuraLunisColors.faint}
          keyboardType="numbers-and-punctuation"
          autoCorrect={false}
        />
        <Text style={styles.label}>BIRTH TIME (optional)</Text>
        <TextInput
          style={styles.input}
          value={time}
          onChangeText={setTime}
          placeholder="HH:MM (defaults to noon)"
          placeholderTextColor={AuraLunisColors.faint}
          keyboardType="numbers-and-punctuation"
          autoCorrect={false}
        />
        <Text style={styles.locationNote}>Location: {locationName}</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={styles.generateBtn} onPress={generate}>
          <Text style={styles.generateText}>Generate My Birth Sky</Text>
        </Pressable>
      </View>

      {profile && (
        <View ref={cardRef} collapsable={false} style={styles.resultCard}>
          <View style={styles.chartWrap}>
            <BirthSkyCanvas
              birthDate={new Date(profile.birthDate)}
              location={location}
              size={272}
              dominantConstellation={profile.dominantConstellation}
              season={extractSeason(profile)}
            />
            <Text style={styles.chartCaption}>The sky over {locationName.toLowerCase()} the night you were born</Text>
          </View>

          {/* Rarity badge — shown to everyone (a teaser of what the full reading holds) */}
          {rare && (
            <View style={styles.rarityBadge}>
              <Text style={styles.rarityText}>✦ Rare: {visiblePlanets.length} planets above the horizon at your birth</Text>
            </View>
          )}

          {/* Sky Story (premium) replaces the redundant cosmic signature. Free users still
              get the signature as a teaser — never both, since they say the same thing. */}
          {isPremium ? (
            <Text style={styles.skyStory}>“{generateSkyStory(profile)}”</Text>
          ) : (
            <Text style={styles.signature}>“{profile.cosmicSignature}”</Text>
          )}

          <View style={styles.divider} />
          <Row label="Sun sign" value={profile.sunSign} />
          <Row label="Moon phase" value={`${profile.moonPhase} · ${profile.moonIllumination}%`} />
          <Row label="Approx. eastern sky" value={profile.risingSign} />
          <Row label="Dominant" value={profile.dominantConstellation} />
          <Row label="Seasonal sky" value={profile.seasonalSky} />
          <Row
            label="Planets up"
            value={visiblePlanets.map((p) => p.name).join(", ") || "None above horizon"}
          />

          {/* Planet detail cards — PREMIUM */}
          {isPremium && visiblePlanets.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.planetsHeader}>PLANETS IN YOUR SKY</Text>
              {visiblePlanets.map((p) => (
                <View key={p.name} style={styles.planetCard}>
                  <View style={[styles.planetDot, { backgroundColor: PLANET_COLORS[p.name] ?? AuraLunisColors.gold }]} />
                  <View style={styles.planetTextWrap}>
                    <Text style={styles.planetName}>{p.name}</Text>
                    <Text style={styles.planetDesc}>
                      {PLANET_BIRTH_MEANINGS[p.name] ?? `${p.name} was above the horizon in ${p.constellation}.`}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Premium → share the full certificate as an image. Free → unlock CTA. */}
          {isPremium ? (
            <Pressable style={styles.shareBtn} onPress={shareBirthSky}>
              <Text style={styles.shareText}>Share Birth Sky ✦</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.unlockBtn} onPress={() => { tapLight(); openPaywall(); }}>
              <Text style={styles.unlockText}>✦ Unlock Your Full Birth Certificate</Text>
            </Pressable>
          )}

          <Text style={styles.watermark}>✦ AuraLunis</Text>
        </View>
      )}
    </ScreenShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { marginBottom: 10 },
  backText: { color: AuraLunisColors.gold, fontSize: 14, fontWeight: "700" },
  intro: { color: AuraLunisColors.silver, fontSize: 14, lineHeight: 21, marginBottom: 18 },
  form: {
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 18,
  },
  label: { color: AuraLunisColors.gold, fontSize: 9, fontWeight: "800", letterSpacing: 1.5, marginBottom: 6, marginTop: 6 },
  input: {
    borderRadius: 12, padding: 12, color: "#FFF", backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1, borderColor: AuraLunisColors.borderSubtle, fontSize: 15,
  },
  locationNote: { color: AuraLunisColors.faint, fontSize: 11, marginTop: 12 },
  error: { color: "#FF9166", fontSize: 12, marginTop: 10 },
  generateBtn: {
    marginTop: 16, borderRadius: 14, paddingVertical: 14, alignItems: "center",
    backgroundColor: AuraLunisColors.gold,
  },
  generateText: { color: AuraLunisColors.cosmicBlack, fontWeight: "900", fontSize: 14 },
  resultCard: {
    backgroundColor: "rgba(217,168,78,0.07)", borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: "rgba(217,168,78,0.22)", marginBottom: 28,
  },
  chartWrap: { alignItems: "center", marginBottom: 16 },
  chartCaption: { color: AuraLunisColors.faint, fontSize: 11, fontStyle: "italic", marginTop: 10, textAlign: "center" },
  signature: { color: AuraLunisColors.gold2, fontSize: 17, lineHeight: 25, fontWeight: "800", fontStyle: "italic" },
  rarityBadge: {
    alignSelf: "center", marginTop: 14,
    backgroundColor: "rgba(217,168,78,0.15)", borderWidth: 1, borderColor: "rgba(217,168,78,0.3)",
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  rarityText: { color: AuraLunisColors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase", textAlign: "center" },
  skyStory: { color: AuraLunisColors.gold2, fontSize: 14, lineHeight: 22, fontStyle: "italic", marginTop: 14 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, gap: 12 },
  rowLabel: { color: AuraLunisColors.muted, fontSize: 13 },
  rowValue: { color: "#FFF", fontSize: 13, fontWeight: "700", flexShrink: 1, textAlign: "right" },
  planetsHeader: { color: AuraLunisColors.gold, fontSize: 9, letterSpacing: 2, fontWeight: "900", marginTop: 16, marginBottom: 10 },
  planetCard: {
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 7,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  planetDot: { width: 12, height: 12, borderRadius: 6 },
  planetTextWrap: { flex: 1 },
  planetName: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  planetDesc: { color: AuraLunisColors.muted, fontSize: 11.5, lineHeight: 16, marginTop: 1 },
  shareBtn: {
    marginTop: 18, borderRadius: 14, paddingVertical: 13, alignItems: "center",
    borderWidth: 1, borderColor: AuraLunisColors.gold,
  },
  shareText: { color: AuraLunisColors.gold2, fontWeight: "900", fontSize: 14 },
  unlockBtn: {
    marginTop: 18, borderRadius: 14, paddingVertical: 14, alignItems: "center",
    backgroundColor: AuraLunisColors.gold,
  },
  unlockText: { color: AuraLunisColors.cosmicBlack, fontWeight: "900", fontSize: 14 },
  watermark: { position: "absolute", bottom: 8, right: 12, fontSize: 8, color: AuraLunisColors.gold, opacity: 0.5 },
});
