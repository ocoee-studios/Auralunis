import { useEffect, useRef, useState } from "react";
import { Gyroscope } from "expo-sensors";

// expo-sensors' published types under this resolution only surface
// isAvailableAsync; the streaming API exists at runtime. Typed locally to match
// (same pattern as useDevicePointing).
type SensorReading = { x: number; y: number; z: number };
interface SensorModule {
  setUpdateInterval: (intervalMs: number) => void;
  addListener: (listener: (reading: SensorReading) => void) => { remove: () => void };
}
const Gyro = Gyroscope as unknown as SensorModule;

export interface ParallaxOffset {
  x: number;
  y: number;
}

// Celestial-dome depth. Feeds the gyroscope's ROTATION RATE (rad/s) through a leaky
// integrator to produce a small screen offset (px): the offset grows while you turn
// the phone and decays back to zero the instant you hold still. The canvas applies
// it to the cloud layers (Milky Way, nebulae) at a fraction of full strength while
// the deep dome stays anchored — so the galaxy floats a touch in front of the star
// field as you pan, giving the flat overlay a sense of depth. Because it settles to
// (0,0) at rest, AR alignment is exact whenever the phone is steady.
//
// Plain React state + a static transform downstream (NO animated SVG props), so it
// stays on the crash-safe path.
export function useParallaxOffset(maxPx = 7, updateMs = 50): ParallaxOffset {
  const [offset, setOffset] = useState<ParallaxOffset>({ x: 0, y: 0 });
  const ref = useRef<ParallaxOffset>({ x: 0, y: 0 });

  useEffect(() => {
    const GAIN = 0.6; // rotation-rate → px
    const DECAY = 0.85; // per-tick leak toward zero
    const clamp = (v: number) => Math.max(-maxPx, Math.min(maxPx, v));

    Gyro.setUpdateInterval(updateMs);
    const sub = Gyro.addListener((r) => {
      // Map yaw-ish (r.y) → horizontal float, pitch (r.x) → vertical float. Layers
      // lag the motion (negative sign) so they read as sitting behind the glass.
      const nx = clamp(ref.current.x * DECAY - r.y * GAIN);
      const ny = clamp(ref.current.y * DECAY - r.x * GAIN);
      const prev = ref.current;
      ref.current = { x: nx, y: ny };
      // Deadband: skip renders while idle; emit one clean (0,0) as motion settles.
      const moved = Math.abs(nx - prev.x) > 0.25 || Math.abs(ny - prev.y) > 0.25;
      const settling = (prev.x !== 0 || prev.y !== 0) && Math.abs(nx) < 0.25 && Math.abs(ny) < 0.25;
      if (moved) setOffset({ x: nx, y: ny });
      else if (settling) {
        ref.current = { x: 0, y: 0 };
        setOffset({ x: 0, y: 0 });
      }
    });
    return () => sub.remove();
  }, [maxPx, updateMs]);

  return offset;
}
