import React, { useEffect } from "react";
import { Circle, G } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  type SharedValue
} from "react-native-reanimated";
import type { HorizontalStar } from "../ephemeris/StarPositions";
import { magnitudeToRadius, starColor, type ProjectFn } from "../SkyLensVisual";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// One pulsing sparkle overlaid on a bright star. Opacity oscillates on the UI
// thread from a shared clock + a per-star phase offset, so they twinkle out of
// sync without re-rendering from JS.
function Sparkle({
  clock,
  x,
  y,
  r,
  color,
  offset
}: {
  clock: SharedValue<number>;
  x: number;
  y: number;
  r: number;
  color: string;
  offset: number;
}) {
  const animatedProps = useAnimatedProps(() => ({
    opacity: 0.15 + 0.7 * (0.5 + 0.5 * Math.sin((clock.value + offset) * Math.PI * 2))
  }));
  return <AnimatedCircle cx={x} cy={y} r={r} fill={color} animatedProps={animatedProps} />;
}

type Props = {
  stars: HorizontalStar[];
  project: ProjectFn;
  nightMode: boolean;
};

const MAX_TWINKLE = 16;

export function TwinkleLayer({ stars, project, nightMode }: Props) {
  const clock = useSharedValue(0);
  useEffect(() => {
    clock.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(clock);
  }, [clock]);

  if (nightMode) return null;

  const targets: { id: string; x: number; y: number; r: number; color: string; offset: number }[] = [];
  for (const s of stars) {
    if (!s.aboveHorizon || s.magnitude > 2.2) continue;
    const p = project(s.azimuthDegrees, s.altitudeDegrees);
    if (!p.onScreen) continue;
    targets.push({
      id: s.id,
      x: p.x,
      y: p.y,
      r: Math.max(magnitudeToRadius(s.magnitude) - 0.4, 1),
      color: starColor(s.id, s.magnitude),
      offset: (s.id.charCodeAt(0) % 10) / 10
    });
    if (targets.length >= MAX_TWINKLE) break;
  }

  return (
    <G>
      {targets.map((t) => (
        <Sparkle key={t.id} clock={clock} x={t.x} y={t.y} r={t.r} color={t.color} offset={t.offset} />
      ))}
    </G>
  );
}
