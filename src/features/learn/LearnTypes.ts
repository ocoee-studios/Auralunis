export type LearnCategoryId =
  | "solar_system"
  | "moon"
  | "planets"
  | "constellations"
  | "stars"
  | "deep_sky"
  | "milky_way"
  | "beginner_path";

export interface LearnTopic {
  id: string;
  categoryId: LearnCategoryId;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  summary: string;
  /** Full lesson body — a few real paragraphs (textbook content, not a placeholder). */
  body?: string;
  keyFacts: string[];
  skyLensAction?: string;
  archiveAction?: string;
  /** When set, "Try in Sky Lens" deep-links to Find Mode on this RA/Dec target. */
  skyTarget?: {
    raHours: number;
    decDegrees: number;
    name: string;
    subtitle?: string;
    description?: string;
  };
}
