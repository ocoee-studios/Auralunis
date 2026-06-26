import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  cancelAnimation
} from "react-native-reanimated";

type MeteorSpec = { id: number; x0: number; y0: number; angle: number; length: number };

// A single shooting star: a gradient streak (transparent tail → bright head) that
// translates across the sky and fades. Crash-safe — it animates an Animated.View's
// transform + opacity via useAnimatedStyle (the supported pattern), never SVG props.
function Meteor({ x0, y0, angle, length, onDone }: MeteorSpec & { onDone: () => void }) {
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

  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const deg = (angle * 180) / Math.PI;
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: dx * 300 * prog.value }, { translateY: dy * 300 * prog.value }],
    opacity: Math.sin(prog.value * Math.PI)
  }));

  return (
    <Animated.View pointerEvents="none" style={[{ position: "absolute", left: x0, top: y0 }, style]}>
      <LinearGradient
        colors={["rgba(255,255,255,0)", "rgba(205,228,255,0.95)"] as const}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ width: length, height: 2.4, borderRadius: 2, transform: [{ rotate: `${deg}deg` }] }}
      />
    </Animated.View>
  );
}

// Spawns a shooting star every ~5–14s for ambiance. Disabled in Night Mode.
// onMeteor fires on each spawn (a rare-event haptic whisper — Apple-delight).
export function MeteorOverlay({ box, nightMode, onMeteor }: { box: { width: number; height: number }; nightMode: boolean; onMeteor?: () => void }) {
  const [meteors, setMeteors] = useState<MeteorSpec[]>([]);
  const idRef = useRef(0);
  const onMeteorRef = useRef(onMeteor);
  onMeteorRef.current = onMeteor;

  useEffect(() => {
    if (nightMode) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        const angle = Math.PI * 0.72 + (Math.random() - 0.5) * 0.7; // mostly downward-diagonal
        onMeteorRef.current?.();
        setMeteors((prev) => [
          ...prev,
          {
            id: idRef.current++,
            x0: Math.random() * box.width,
            y0: Math.random() * box.height * 0.5,
            angle,
            length: 60 + Math.random() * 55
          }
        ]);
        schedule();
      }, 5000 + Math.random() * 9000);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [box.width, box.height, nightMode]);

  if (nightMode) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {meteors.map((m) => (
        <Meteor key={m.id} {...m} onDone={() => setMeteors((prev) => prev.filter((x) => x.id !== m.id))} />
      ))}
    </View>
  );
}
