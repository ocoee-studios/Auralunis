import React, { useEffect, useRef, useState } from "react";
import { G, Line } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  cancelAnimation
} from "react-native-reanimated";

const AnimatedLine = Animated.createAnimatedComponent(Line);

type MeteorSpec = {
  id: number;
  x0: number;
  y0: number;
  vx: number;
  vy: number;
  length: number;
  color: string;
};

// A single streak: the head travels along (vx,vy) while a trailing tail follows,
// fading in then out — all on the UI thread.
function Meteor({ x0, y0, vx, vy, length, color, onDone }: MeteorSpec & { onDone: () => void }) {
  const prog = useSharedValue(0);
  useEffect(() => {
    prog.value = withTiming(1, { duration: 850, easing: Easing.out(Easing.quad) });
    const t = setTimeout(onDone, 950);
    return () => {
      cancelAnimation(prog);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const travel = 240;
    const hx = x0 + vx * travel * prog.value;
    const hy = y0 + vy * travel * prog.value;
    return {
      x1: hx,
      y1: hy,
      x2: hx - vx * length,
      y2: hy - vy * length,
      opacity: Math.sin(prog.value * Math.PI) * 0.9
    };
  });

  return <AnimatedLine animatedProps={animatedProps} stroke={color} strokeWidth={2} strokeLinecap="round" />;
}

type Props = {
  box: { width: number; height: number };
  nightMode: boolean;
};

// Spawns a shooting star every ~4–11s for ambiance. Screen-space (independent of
// where the device points). Disabled in Night Mode.
export function MeteorLayer({ box, nightMode }: Props) {
  const [meteors, setMeteors] = useState<MeteorSpec[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (nightMode) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        const angle = Math.PI * 0.66 + (Math.random() - 0.5) * 0.6; // mostly downward-diagonal
        setMeteors((prev) => [
          ...prev,
          {
            id: idRef.current++,
            x0: Math.random() * box.width,
            y0: Math.random() * box.height * 0.45,
            vx: Math.cos(angle),
            vy: Math.sin(angle),
            length: 55 + Math.random() * 45,
            color: Math.random() < 0.3 ? "#BFE0FF" : "#FFFFFF"
          }
        ]);
        schedule();
      }, 4000 + Math.random() * 7000);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [box.width, box.height, nightMode]);

  if (nightMode) return null;

  return (
    <G>
      {meteors.map((m) => (
        <Meteor key={m.id} {...m} onDone={() => setMeteors((prev) => prev.filter((x) => x.id !== m.id))} />
      ))}
    </G>
  );
}
