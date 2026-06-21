import { useEffect, useMemo, useState } from "react";
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

// Streams accelerometer + magnetometer and derives the back camera's pointing
// direction. The math is exact; real-world accuracy still depends on sensor
// calibration, device FOV, and magnetic declination — tune those outdoors.
export function useDevicePointing(updateMs = 120, magneticDeclinationDegrees = 0): DevicePointingState {
  const [accelerometer, setAccelerometer] = useState<Vec3>({ x: 0, y: 0, z: 1 });
  const [magnetometer, setMagnetometer] = useState<Vec3 | null>(null);

  useEffect(() => {
    Sensors.Accelerometer.setUpdateInterval(updateMs);
    Sensors.Magnetometer.setUpdateInterval(updateMs);
    // Exponential smoothing damps the raw sensor jitter so the overlay glides
    // instead of twitching — that high-frequency jitter is what reads as "laggy".
    const ema = (prev: Vec3, next: SensorReading, a = 0.3): Vec3 => ({
      x: prev.x + (next.x - prev.x) * a,
      y: prev.y + (next.y - prev.y) * a,
      z: prev.z + (next.z - prev.z) * a,
    });
    const accelSub = Sensors.Accelerometer.addListener((r) => setAccelerometer((prev) => ema(prev, r)));
    const magSub = Sensors.Magnetometer.addListener((r) => setMagnetometer((prev) => (prev ? ema(prev, r) : r)));

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
    // iOS reports accelerometer with the opposite sign convention to what the
    // orientation math assumes, so the camera's altitude (pitch) comes out
    // inverted on-device — sky objects only appeared when pointing at the ground.
    // Flip the altitude here, at the real-sensor boundary (keeps the pure math +
    // its self-test untouched).
    return { ...p, altitudeDegrees: -p.altitudeDegrees };
  }, [accelerometer, magnetometer, magneticDeclinationDegrees]);

  return { pointing, available: magnetometer !== null };
}
