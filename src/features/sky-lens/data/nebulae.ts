// A small set of the most famous, recognizable deep-sky objects, rendered as soft
// colored glows at their real sky positions. Adds pops of color + depth (the
// "nebula haze" of Phase 2). J2000 RA (hours) / Dec (degrees); `color` is a
// stylized hue, `radius` the on-screen glow size in px.
export interface Nebula {
  id: string;
  name: string;
  raHours: number;
  decDegrees: number;
  magnitude: number; // unused for sizing, kept so it fits the star pipeline shape
  con: string;
  color: string;
  radius: number;
}

export const NEBULAE: ReadonlyArray<Nebula> = [
  { id: "m42", name: "Orion Nebula", raHours: 5.588, decDegrees: -5.39, magnitude: 4, con: "Ori", color: "#E79BB8", radius: 26 },
  { id: "m45", name: "Pleiades", raHours: 3.79, decDegrees: 24.12, magnitude: 1.6, con: "Tau", color: "#9FC0FF", radius: 22 },
  { id: "m31", name: "Andromeda Galaxy", raHours: 0.712, decDegrees: 41.27, magnitude: 3.4, con: "And", color: "#CFD8F0", radius: 30 },
  { id: "m8", name: "Lagoon Nebula", raHours: 18.06, decDegrees: -24.38, magnitude: 6, con: "Sgr", color: "#E5A0B4", radius: 22 },
  { id: "ngc3372", name: "Carina Nebula", raHours: 10.752, decDegrees: -59.87, magnitude: 1, con: "Car", color: "#E89B9B", radius: 26 },
  { id: "ngc7000", name: "North America Nebula", raHours: 20.97, decDegrees: 44.5, magnitude: 4, con: "Cyg", color: "#E59090", radius: 22 },
  { id: "m33", name: "Triangulum Galaxy", raHours: 1.564, decDegrees: 30.66, magnitude: 5.7, con: "Tri", color: "#BFD0F0", radius: 22 },
  { id: "m16", name: "Eagle Nebula", raHours: 18.313, decDegrees: -13.78, magnitude: 6, con: "Ser", color: "#E0A0A8", radius: 18 }
];
