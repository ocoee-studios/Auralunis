#!/usr/bin/env python3
from pathlib import Path

path = Path("src/features/sky-lens/SkyLensScreen.tsx")
text = path.read_text()

replacements = [
    (
        'const [skyMode, setSkyMode] = useState<"ar" | "immersive" | "planetarium">("ar");',
        'const [skyMode, setSkyMode] = useState<"ar" | "immersive" | "planetarium">("planetarium");'
    ),
    (
        'const [cinematic, setCinematic] = useState(false);',
        'const [cinematic, setCinematic] = useState(true);'
    ),
    (
        'const scrimOpacity = useRef(new Animated.Value(0.35)).current;',
        'const scrimOpacity = useRef(new Animated.Value(0.16)).current;'
    ),
    (
        'if (!moon.aboveHorizon) return "☾  The Moon is below the horizon right now";',
        'if (!moon.aboveHorizon) return null;'
    ),
    (
        'const milkyWayBoost = (planetarium ? 2.4 : cinematic ? 2.1 : immersive ? 1.9 : 1.4) * skyProfile.milkyWayOpacity * magnificentBoost * gate.milkyWayBoostMultiplier;',
        'const milkyWayBoost = (planetarium ? 3.15 : cinematic ? 2.35 : immersive ? 1.9 : 1.15) * skyProfile.milkyWayOpacity * magnificentBoost * gate.milkyWayBoostMultiplier;'
    ),
    (
        'const nebulaOpacity = Math.min(1, skyProfile.nebulaOpacity * magnificentBoost);',
        'const nebulaOpacity = Math.min(1, Math.max(0.72, skyProfile.nebulaOpacity * magnificentBoost));'
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
    print("Sky Lens celestial default patch applied cleanly.")

path.write_text(text)
