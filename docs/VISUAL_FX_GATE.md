# Visual FX Contribution Gate

**Main must always run on device without crashes.** No exceptions.

## The rule (applies to everyone — Claude, Gemini, Claude Code, any new visual work)

Visual FX layers and any new visual work **do NOT go directly to `main`.**

1. Branch: `git checkout -b visual/sacred-sky-pass`
2. Push to that branch and open a PR.
3. **Claude Code reviews + tests on device (Expo) before merge.**
4. If it crashes Expo → it never touches main. If it passes → Claude Code merges.

## Why — the crash pattern that keeps slipping in

On this stack (**RN 0.81 + Reanimated 4 + react-native-svg 15**) animating
react-native-svg props via `useAnimatedProps` on an `Animated.createAnimatedComponent(<svg element>)`
**crashes on device** — and it passes `tsc` and the Metro bundle, so the build gate
does NOT catch it. Two shipped layers already carried this (CosmicDriftGalaxy,
ConstellationForge v1); both are fixed.

### Crash-safe pattern (REQUIRED for animation)
- Animate an **`Animated.View`** via **`useAnimatedStyle`** (opacity / transform), with a **static** `<Svg>` inside. ✅
- Or drive a **JS clock** (`useState` + `setInterval`) that re-renders the SVG with **static** props (e.g. `strokeDashoffset`, `r`, `opacity` computed from progress). ✅

### Never do this
- `const A = Animated.createAnimatedComponent(Circle/Line/Path/G/...)` + `useAnimatedProps` feeding it SVG props. ❌ (crashes)
- Calling any hook (`useAnimatedProps`, `useAnimatedStyle`, …) **inside `.map()`**. ❌ (rules of hooks)

A clean signal to check before merge:
`grep -rnE "useAnimatedProps|createAnimatedComponent\((Circle|Line|Path|G|Ellipse|Polyline|Rect|Svg)\)" src/` must return **nothing** (comments aside).
