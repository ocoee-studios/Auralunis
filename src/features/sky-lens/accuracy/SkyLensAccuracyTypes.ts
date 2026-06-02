export interface ObserverLocation {
  latitudeDegrees: number;
  longitudeDegrees: number;
  altitudeMeters?: number;
}

export interface DevicePose {
  headingDegrees: number;
  pitchDegrees: number;
  rollDegrees: number;
  accuracyDegrees?: number;
  timestampISO: string;
}

export interface CelestialTarget {
  id: string;
  name: string;
  rightAscensionHours?: number;
  declinationDegrees?: number;
  azimuthDegrees: number;
  altitudeDegrees: number;
  magnitude?: number;
}

export interface SkyLensProjectedTarget {
  target: CelestialTarget;
  screenX: number;
  screenY: number;
  angularErrorDegrees: number;
  visible: boolean;
}

export interface SkyLensAccuracyResult {
  targetId: string;
  targetName: string;
  expectedAzimuthDegrees: number;
  actualAzimuthDegrees: number;
  expectedAltitudeDegrees: number;
  actualAltitudeDegrees: number;
  azimuthErrorDegrees: number;
  altitudeErrorDegrees: number;
  totalAngularErrorDegrees: number;
  pass: boolean;
}

export interface SkyLensAccuracyThresholds {
  calculationToleranceDegrees: number;
  calibratedAROverlayToleranceDegrees: number;
  uncalibratedAROverlayToleranceDegrees: number;
}
