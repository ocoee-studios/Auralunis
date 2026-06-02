export type SkyLensMode =
  | "sky_lens"
  | "manual_map"
  | "find_mode"
  | "tap_object"
  | "xray_lens"
  | "birth_overlay"
  | "guided_tour"
  | "capture"
  | "deep_sky"
  | "galaxy_mode";

export interface SkyLensObject {
  object_id: string;
  name: string;
  type:
    | "planet"
    | "moon"
    | "star"
    | "constellation"
    | "nebula"
    | "galaxy"
    | "star_cluster"
    | "supernova_remnant"
    | "milky_way_region"
    | "satellite"
    | "event";
  visible_now: boolean;
  altitude_degrees: number;
  azimuth_degrees: number;
  direction_label: string;
  science_summary: string;
  mythology_summary?: string;
  archive_slug?: string;
}
