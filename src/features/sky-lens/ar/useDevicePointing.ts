import { useEffect, useMemo, useRef, useState } from "react";
import { Accelerometer, Magnetometer } from "expo-sensors";
import { pointingFromSensors, type Vec3 } from "./SkyLensOrientation";
import type { CameraPointing } from "./SkyLensProjection";

// expo-sensors' published types under this resolution only surface
// isAvailableAsync; the streaming API exists at runtime. Typed locally to match.
type SensorReading = { x: number; y: number; z: number };
interface SensorModule {
  setUpdateInterval: (intervalMs: number) => void;
  addListener: (listener: (reading: SensorReading) => void) => { remove: () => void };
}
const Sensors = { Accelerometer, Magnetometer } as unknown as {
  Accelerometer: SensorModule;
  Magnetometer: SensorModule;
};

export interface DevicePointingState {
  pointing: CameraPointing;
  available: boolean;
}

const shortestAngleDelta = (from: number, to: number) => {
  let delta = (to - from + 540) % 360 - 180;
  if (delta === -180) delta = 180;
  return delta;
};

const stabilizeAngle = (
  previous: number,
  next: number,
  deadZoneDegrees: number,
  gentleFollow: number
) => {
  const delta = shortestAngleDelta(previous, next);
  const magnitude = Math.abs(delta);

  // Ignore tiny sensor tremors completely. Once the user makes an intentional move,
  // smoothly catch up; large pans remain responsive instead of feeling stuck.
  if (magnitude <= deadZoneDegrees) return previous;
  const follow = magnitude > 8 ? 0.72 : magnitude > 3 ? 0.48 : gentleFollow;
  return previous + delta * follow;
};

// Streams accelerometer + magnetometer and derives the back camera's pointing
// direction. Two-stage stabilization is used: vector EMA removes raw sensor noise,
// then an angular dead zone prevents tiny hand tremors from moving the whole sky.
export function useDevicePointing(
  updateMs = 120,
  magneticDeclinationDegrees = 0,
  smoothingAlpha = 0.3
): DevicePointingState {
  const [accelerometer, setAccelerometer] = useState<Vec3>({ x: 0, y: 0, z: 1 });
  const [magnetometer, setMagnetometer] = useState<Vec3 | null>(null);
  const alphaRef = useRef(smoothingAlpha);
  alphaRef.current = smoothingAlpha;
  const stablePointingRef = useRef<CameraPointing | null>(null);

  useEffect(() => {
    Sensors.Accelerometer.setUpdateInterval(updateMs);
    Sensors.Magnetometer.setUpdateInterval(updateMs);

    const ema = (prev: Vec3, next: SensorReading): Vec3 => {
      // The previous 0.32 normal-zoom rate was visually twitchy on a physical iPhone.
      // Cap it here so every caller benefits from steadier sensor vectors.
      const a = Math.min(alphaRef.current, 0.16);
      return {
        x: prev.x + (next.x - prev.x) * a,
        y: prev.y + (next.y - prev.y) * a,
        z: prev.z + (next.z - prev.z) * a,
      };
    };

    const accelSub = Sensors.Accelerometer.addListener((r) =>
      setAccelerometer((prev) => ema(prev, r))
    );
    const magSub = Sensors.Magnetometer.addListener((r) =>
      setMagnetometer((prev) => (prev ? ema(prev, r) : r))
    );

    return () => {
      accelSub.remove();
      magSub.remove();
    };
  }, [updateMs]);

  const pointing = useMemo<CameraPointing>(() => {
    if (!magnetometer) {
      return { azimuthDegrees: 0, altitudeDegrees: 0, rollDegrees: 0 };
    }

    const p = pointingFromSensors(accelerometer, magnetometer, magneticDeclinationDegrees);
    const raw: CameraPointing = { ...p, altitudeDegrees: -p.altitudeDegrees };
    const previous = stablePointingRef.current;

    if (!previous) {
      stablePointingRef.current = raw;
      return raw;
    }

    const stable: CameraPointing = {
      azimuthDegrees: stabilizeAngle(previous.azimuthDegrees, raw.azimuthDegrees, 0.55, 0.24),
      altitudeDegrees: stabilizeAngle(previous.altitudeDegrees, raw.altitudeDegrees, 0.4, 0.22),
      rollDegrees: stabilizeAngle(previous.rollDegrees, raw.rollDegrees, 0.65, 0.2),
    };
    stablePointingRef.current = stable;
    return stable;
  }, [accelerometer, magnetometer, magneticDeclinationDegrees]);

  return { pointing, available: magnetometer !== null };
}
