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
  keyFacts: string[];
  skyLensAction?: string;
  archiveAction?: string;
}
