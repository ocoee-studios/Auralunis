export type CelestialAlarmTrigger =
  | "fixed_time"
  | "sunrise"
  | "sunset"
  | "moonrise"
  | "moonset"
  | "planet_visible"
  | "stargazing_window"
  | "daily_alignment_peak"
  | "wind_down";

export interface CelestialAlarm {
  id: string;
  title: string;
  trigger: CelestialAlarmTrigger;
  enabled: boolean;
  offsetMinutes?: number;
}

export interface TonightsRitualStep {
  id: string;
  title: string;
  actionType: "sky_lens" | "sound_bath" | "note" | "breath" | "archive" | "calendar";
  completed: boolean;
}

export interface LifeSkyMoment {
  id: string;
  title: string;
  timestampISO: string;
  skyStateSnapshotId: string;
  note?: string;
}

export interface AstralSeal {
  id: string;
  name: string;
  icon: string;
  earnedAtISO?: string;
}
