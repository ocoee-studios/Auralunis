// planetaryEphemeris.ts
// Trigonometric orbital models for the major planets — Deep Space Mode.
// Accuracy: ~1° for inner planets, ~0.5° for outer planets over a 10-year window.
// Good enough for "point your phone at Jupiter" — not for scientific navigation.
//
// Based on the simplified two-body Keplerian elements from the JPL Horizons
// low-precision tables (Jan 2000 epoch, J2000.0 ecliptic frame).
// Reference: https://ssd.jpl.nasa.gov/planets/approx_pos.html

import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import type { SpatialTarget } from "@/utils/alignmentEngine";

export type PlanetId = "mercury" | "venus" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune";

export interface PlanetInfo {
  id: PlanetId;
  name: string;
  radarColor: string;
  /** Mean distance from Sun in AU */
  semiMajorAxisAU: number;
  /** Visual magnitude at opposition (rough) */
  magnitude: number;
  /** Fun fact for the data card */
  fact: string;
}

export const PLANETS: Record<PlanetId, PlanetInfo> = {
  mercury: { id: "mercury", name: "Mercury", radarColor: "#B4B2A9", semiMajorAxisAU: 0.387, magnitude: -1.9, fact: "A day on Mercury is longer than its year." },
  venus:   { id: "venus",   name: "Venus",   radarColor: "#FFF6D6", semiMajorAxisAU: 0.723, magnitude: -4.6, fact: "Venus rotates backwards relative to most planets." },
  mars:    { id: "mars",    name: "Mars",    radarColor: "#F0997B", semiMajorAxisAU: 1.524, magnitude: -2.9, fact: "Mars has the tallest volcano in the Solar System — Olympus Mons." },
  jupiter: { id: "jupiter", name: "Jupiter", radarColor: "#EF9F27", semiMajorAxisAU: 5.203, magnitude: -2.9, fact: "Jupiter's Great Red Spot is a storm larger than Earth." },
  saturn:  { id: "saturn",  name: "Saturn",  radarColor: "#D9A84E", semiMajorAxisAU: 9.537, magnitude: -0.5, fact: "Saturn's rings are mostly ice — some chunks are as large as houses." },
  uranus:  { id: "uranus",  name: "Uranus",  radarColor: "#9FE1CB", semiMajorAxisAU: 19.19, magnitude: 5.7,  fact: "Uranus rotates on its side with a 98° axial tilt." },
  neptune: { id: "neptune", name: "Neptune", radarColor: "#85B7EB", semiMajorAxisAU: 30.07, magnitude: 7.8,  fact: "Neptune's winds are the fastest in the Solar System — 2,100 km/h." },
};

// Keplerian elements at J2000.0 + their century rates
// [a (AU), e, I (deg), L (deg), long.peri (deg), long.node (deg)]
// + [da, de, dI, dL, dLong.peri, dLong.node] per century
const ELEMENTS: Record<PlanetId, [number,number,number,number,number,number,number,number,number,number,number,number]> = {
  mercury: [0.38709927,0.20563593,7.00497902,252.25032350,77.45779628,48.33076593,  0.00000037,0.00001906,-0.00594749,149472.67411175,0.16047689,-0.12534081],
  venus:   [0.72333566,0.00677672,3.39467605,181.97909950,131.60246718,76.67984255,  0.00000390,-0.00004107,-0.00078890,58517.81538729,0.00268329,-0.27769418],
  mars:    [1.52371034,0.09339410,1.84969142,-4.55343205,-23.94362959,49.55953891,  0.00001847,0.00007882,-0.00813131,19140.30268499,0.44441088,-0.29257343],
  jupiter: [5.20288700,0.04838624,1.30439695,34.39644051,14.72847983,100.47390909,  -0.00011607,-0.00013253,-0.00183714,3034.74612775,0.21252668,0.20469106],
  saturn:  [9.53667594,0.05386179,2.48599187,49.95424423,92.59887831,113.66242448,  -0.00125060,-0.00050991,0.00193609,1222.49362201,-0.41897216,-0.28867794],
  uranus:  [19.18916464,0.04725744,0.77263783,313.23810451,170.95427630,74.01692503,  -0.00196176,-0.00004397,-0.00242939,428.48202785,0.40805281,0.04240589],
  neptune: [30.06992276,0.00859048,1.77004347,-55.12002969,44.96476227,131.78422574,  0.00026291,0.00005105,0.00035372,218.45945325,-0.32241464,-0.00508664],
};

function toRad(d: number): number { return d * Math.PI / 180; }
function toDeg(r: number): number { return r * 180 / Math.PI; }
function mod360(d: number): number { return ((d % 360) + 360) % 360; }

/** Julian centuries since J2000.0 */
function julianCenturies(date: Date): number {
  const J2000 = 2451545.0;
  const jd = date.getTime() / 86400000 + 2440587.5;
  return (jd - J2000) / 36525;
}

/** Compute heliocentric ecliptic coordinates (AU, degrees) for a planet */
function heliocentricEcliptic(id: PlanetId, date: Date): { x: number; y: number; z: number } {
  const T = julianCenturies(date);
  const [a0,e0,I0,L0,w0,O0, da,de,dI,dL,dw,dO] = ELEMENTS[id];

  const a = a0 + da * T;
  const e = e0 + de * T;
  const I = toRad(I0 + dI * T);
  const L = toRad(mod360(L0 + dL * T));
  const w = toRad(mod360(w0 + dw * T));
  const O = toRad(mod360(O0 + dO * T));

  // Argument of perihelion
  const omega = w - O;
  // Mean anomaly
  let M = mod360(toDeg(L) - toDeg(w));
  if (M > 180) M -= 360;
  const Mrad = toRad(M);

  // Eccentric anomaly (Newton-Raphson)
  let E = Mrad;
  for (let i = 0; i < 8; i++) {
    E = E - (E - e * Math.sin(E) - Mrad) / (1 - e * Math.cos(E));
  }

  // Heliocentric coords in orbital plane
  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);

  // Rotate to ecliptic plane
  const cosO = Math.cos(O), sinO = Math.sin(O);
  const cosI = Math.cos(I), sinI = Math.sin(I);
  const cosw = Math.cos(omega), sinw = Math.sin(omega);

  const x = (cosO * cosw - sinO * sinw * cosI) * xp + (-cosO * sinw - sinO * cosw * cosI) * yp;
  const y = (sinO * cosw + cosO * sinw * cosI) * xp + (-sinO * sinw + cosO * cosw * cosI) * yp;
  const z = (sinw * sinI) * xp + (cosw * sinI) * yp;

  return { x, y, z };
}

/** Earth's heliocentric ecliptic position (needed to convert to geocentric) */
function earthHeliocentric(date: Date): { x: number; y: number; z: number } {
  // Earth uses the EM-Bary elements (good enough)
  const T = julianCenturies(date);
  const L = toRad(mod360(100.46457166 + 35999.37244981 * T));
  const a = 1.00000018;
  const e = 0.01670862 - 0.00004204 * T;
  let M = mod360(357.52910918 + 35999.05028 * T);
  if (M > 180) M -= 360;
  const Mrad = toRad(M);
  let E = Mrad;
  for (let i = 0; i < 8; i++) {
    E = E - (E - e * Math.sin(E) - Mrad) / (1 - e * Math.cos(E));
  }
  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const cosL = Math.cos(L), sinL = Math.sin(L);
  return { x: cosL * xp - sinL * yp, y: sinL * xp + cosL * yp, z: 0 };
}

/** Convert geocentric ecliptic to equatorial (J2000.0 obliquity 23.4393°) */
function eclipticToEquatorial(xE: number, yE: number, zE: number): { ra: number; dec: number; distAU: number } {
  const eps = toRad(23.4393);
  const cosE = Math.cos(eps), sinE = Math.sin(eps);
  const xEq = xE;
  const yEq = cosE * yE - sinE * zE;
  const zEq = sinE * yE + cosE * zE;
  const dist = Math.sqrt(xEq * xEq + yEq * yEq + zEq * zEq);
  const ra = mod360(toDeg(Math.atan2(yEq, xEq)));
  const dec = toDeg(Math.asin(zEq / dist));
  return { ra, dec, distAU: dist };
}

/** Convert RA/Dec + observer location to azimuth/altitude */
function raDecToAltAz(
  ra: number, dec: number,
  observerLat: number, observerLon: number,
  date: Date
): { azimuth: number; altitude: number } {
  // Greenwich Mean Sidereal Time
  const T = julianCenturies(date);
  const GMST = mod360(280.46061837 + 360.98564736629 * (date.getTime() / 86400000 + 2440587.5 - 2451545.0) + T * T * 0.000387933);
  const LST = mod360(GMST + observerLon);
  const HA = toRad(mod360(LST - ra));

  const latRad = toRad(observerLat);
  const decRad = toRad(dec);

  const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(HA);
  const altitude = toDeg(Math.asin(Math.max(-1, Math.min(1, sinAlt))));

  const cosA = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / (Math.cos(latRad) * Math.cos(toRad(altitude)));
  let azimuth = toDeg(Math.acos(Math.max(-1, Math.min(1, cosA))));
  if (Math.sin(HA) > 0) azimuth = 360 - azimuth;

  return { azimuth: mod360(azimuth), altitude };
}

/**
 * Compute az/alt + distance for all planets visible from the observer's location.
 * Returns SpatialTarget-compatible objects for use with calculateAlignment().
 */
export function computePlanetaryTargets(
  observer: ObserverLocation,
  date: Date = new Date()
): Array<SpatialTarget & { planet: PlanetInfo; distAU: number; azimuth: number; altitude: number }> {
  const earth = earthHeliocentric(date);

  return (Object.keys(PLANETS) as PlanetId[]).map((id) => {
    const info = PLANETS[id];
    const helio = heliocentricEcliptic(id, date);

    // Geocentric ecliptic
    const gx = helio.x - earth.x;
    const gy = helio.y - earth.y;
    const gz = helio.z - earth.z;

    const { ra, dec, distAU } = eclipticToEquatorial(gx, gy, gz);
    const { azimuth, altitude } = raDecToAltAz(ra, dec, observer.latitudeDegrees, observer.longitudeDegrees, date);

    // For alignment engine: use a very large altitude (planets are "infinitely" far)
    // We treat them as points on a sphere — altitudeKm is set to a large value
    // and the bearing/elevation math handles them like any other SpatialTarget.
    // The radar scale in DeepSpaceMode uses angular error, not km.
    const distKm = distAU * 149_597_870;

    // Back-project to lat/lon for compatibility with alignmentEngine
    // (engine uses haversine; for planets we supply az/alt directly)
    return {
      id: info.id,
      name: info.name,
      latitudeDegrees: dec,           // ecliptic declination ≈ rough lat proxy
      longitudeDegrees: ra,            // RA ≈ rough lon proxy (good enough for bearing calc)
      altitudeKm: distKm,
      planet: info,
      distAU,
      azimuth,
      altitude,
    };
  });
}

/** Convenience: compute alignment directly from pre-computed az/alt */
export function planetAlignmentDiff(
  deviceAzimuth: number,
  devicePitch: number,
  targetAzimuth: number,
  targetAltitude: number
): { azimuthDiff: number; elevationDiff: number; totalAngularError: number; alignmentScore: number; isLocked: boolean } {
  const azimuthDiff = (((targetAzimuth - deviceAzimuth + 180) % 360) + 360) % 360 - 180;
  const elevationDiff = targetAltitude - devicePitch;
  const totalAngularError = Math.sqrt(azimuthDiff ** 2 + elevationDiff ** 2);
  const alignmentScore = Math.max(0, Math.round(100 * (1 - totalAngularError / 90)));
  const isLocked = totalAngularError < 3.5;
  return { azimuthDiff, elevationDiff, totalAngularError, alignmentScore, isLocked };
}
