#!/usr/bin/env python3
from pathlib import Path

path = Path("src/features/sky-lens/SkyLensScreen.tsx")
text = path.read_text()

replacements = [
    # Kill the time-of-day/sunset gradient. Sky Lens should look like premium deep
    # space first, not orange dusk bands.
    (
        'const skyColors = skyGradient(sunAltitude);',
        'const skyColors = ["#01030A", "#030816", "#050817", "#02030A"] as const;'
    ),
    # Start with a darker but not fully crushed sky so the art/nebula assets can show.
    (
        'const scrimOpacity = useRef(new Animated.Value(0.16)).current;',
        'const scrimOpacity = useRef(new Animated.Value(0.08)).current;'
    ),
    # Remove the huge breathing/curtain effect intensity in the scene.
    (
        'intensity={(planetarium ? 0.9 : 0.55) * horizonFade}',
        'intensity={(planetarium ? 0.18 : 0.08) * horizonFade}'
    ),
    (
        'intensity={(planetarium ? 0.55 : 0.4) * horizonFade}',
        'intensity={(planetarium ? 0.08 : 0.04) * horizonFade}'
    ),
    (
        'intensity={(planetarium ? 0.9 : 0.5) * horizonFade}',
        'intensity={(planetarium ? 0.16 : 0.08) * horizonFade}'
    ),
    (
        'intensity={(planetarium ? 0.9 : 0.6) * horizonFade}',
        'intensity={(planetarium ? 0.08 : 0.04) * horizonFade}'
    ),
    # The aurora curtain is the vertical cheap-looking ribbon system in the screenshots.
    (
        'visible={planetarium}\n            intensity={0.55}',
        'visible={false}\n            intensity={0}'
    ),
    # Disable seasonal warm/cool screen wash. It fought the nebula art and created mud.
    (
        'const seasonalTint = useMemo(\n    () => getSeasonalTint((observerTime ?? new Date()).getMonth(), location?.latitudeDegrees ?? 0),\n    [observerTime, location?.latitudeDegrees]\n  );',
        'const seasonalTint = { warm: 0, cool: 0 };'
    ),
]

missing = []
for old, new in replacements:
    if old not in text:
        missing.append(old)
    text = text.replace(old, new, 1)

if missing:
    print("Patch completed with warnings. Missing patterns:")
    for item in missing:
        print("-", item)
else:
    print("Sky Lens black-space patch applied cleanly.")

path.write_text(text)
