// Sound Observatory — NASA sonification data descriptions and playback config.
// Real electromagnetic data from space missions, converted to audible frequencies.

export interface SonificationTrack {
  id: string;
  name: string;
  source: string;
  body: string;
  description: string;
  durationSeconds: number;
  frequencyRange: string;
  nasaSource: string;
}

export const sonificationTracks: SonificationTrack[] = [
  { id: "jupiter_magnetosphere", name: "Jupiter's Magnetosphere", source: "Voyager 1", body: "Jupiter", description: "Electromagnetic waves trapped in Jupiter's massive magnetic field. The eerie whistles and chirps are plasma waves at frequencies shifted into the audible range.", durationSeconds: 120, frequencyRange: "20 Hz – 8 kHz (shifted)", nasaSource: "NASA/JPL Voyager Plasma Wave Science" },
  { id: "saturn_rings", name: "Saturn's Ring Particles", source: "Cassini", body: "Saturn", description: "The sound of thousands of dust particles striking Cassini as it passed through gaps in Saturn's rings. Each click is a grain of ice hitting the spacecraft at 30 km/s.", durationSeconds: 90, frequencyRange: "Original impact frequencies", nasaSource: "NASA/JPL Cassini RPWS" },
  { id: "pulsar_vela", name: "Vela Pulsar", source: "Chandra X-ray Observatory", body: "Vela Supernova Remnant", description: "A neutron star spinning 11 times per second, converting its X-ray pulses into audible rhythm. The regularity rivals an atomic clock.", durationSeconds: 60, frequencyRange: "11 Hz fundamental", nasaSource: "NASA/CXC" },
  { id: "sun_oscillations", name: "Solar Oscillations", source: "SOHO", body: "Sun", description: "The Sun vibrates in millions of simultaneous modes. These pressure waves, sped up 42,000 times, produce a deep, resonant hum — the actual sound of a star.", durationSeconds: 180, frequencyRange: "3 mHz shifted to audible", nasaSource: "ESA/NASA SOHO MDI" },
  { id: "earth_chorus", name: "Earth's Chorus Waves", source: "RBSP/Van Allen Probes", body: "Earth", description: "Electromagnetic waves in Earth's magnetosphere that sound like birdsong. Created by electrons spiraling along magnetic field lines during geomagnetic storms.", durationSeconds: 90, frequencyRange: "0.5 – 5 kHz", nasaSource: "NASA Van Allen Probes EMFISIS" },
  { id: "black_hole_perseus", name: "Black Hole Sound (Perseus)", source: "Chandra X-ray Observatory", body: "Perseus Cluster", description: "Pressure waves from a supermassive black hole rippling through galaxy cluster gas — the lowest note ever detected. The original frequency is 57 octaves below middle C.", durationSeconds: 60, frequencyRange: "Bb, 57 octaves below middle C (shifted up)", nasaSource: "NASA/CXC" },
  { id: "interstellar_plasma", name: "Interstellar Plasma Hum", source: "Voyager 1", body: "Interstellar Space", description: "The faint, persistent hum of plasma in interstellar space detected by Voyager 1 after it crossed the heliopause. The sound of the space between stars.", durationSeconds: 120, frequencyRange: "~3 kHz plasma frequency", nasaSource: "NASA/JPL Voyager PWS" }
];

export function getTrackForBody(bodyId: string): SonificationTrack | undefined {
  return sonificationTracks.find(t => t.body.toLowerCase().includes(bodyId.toLowerCase()));
}
