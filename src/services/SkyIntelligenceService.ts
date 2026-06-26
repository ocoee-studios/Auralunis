// SkyIntelligenceService.ts — "Tonight is special"
// Surfaces the ONE most interesting thing in the sky right now.
// Not a list. Not data. A single compelling insight.

import { getUpcomingEvents, getThisWeekEvents } from "@/data/CelestialEvents";

export interface SkyInsight {
  headline: string;    // "Tonight the Milky Way is magnificent."
  detail: string;      // "The galactic core rises at 9:42 PM..."
  icon: string;        // emoji
  priority: number;    // higher = more important
  action?: string;     // "Open Sky Lens" / "See in Sky Lens"
}

export function getTonightInsight(
  moonIllumination: number,
  moonAltitude: number,
  cloudCover: number,
  visiblePlanets: string[],
  stargazingScore: number,
): SkyInsight {
  const insights: SkyInsight[] = [];

  // Check for events this week
  const weekEvents = getThisWeekEvents();
  for (const event of weekEvents) {
    if (event.rating >= 4) {
      insights.push({
        headline: event.name + " is happening now.",
        detail: event.description,
        icon: event.type === "meteor" ? "🌠" : event.type === "eclipse" ? "🌑" : "✨",
        priority: event.rating * 20,
        action: "See in Sky Lens",
      });
    }
  }

  // Magnificent night
  if (stargazingScore >= 90) {
    insights.push({
      headline: "Tonight is one of the best nights this month.",
      detail: "Clear skies, minimal moonlight. The Milky Way will be stunning after 10 PM.",
      icon: "🌌",
      priority: 95,
      action: "Open Sky Lens",
    });
  } else if (stargazingScore >= 80) {
    insights.push({
      headline: "Tonight is excellent for stargazing.",
      detail: "Good conditions for deep sky observation and astrophotography.",
      icon: "✨",
      priority: 80,
      action: "Open Sky Lens",
    });
  }

  // New moon = dark sky opportunity
  if (moonIllumination < 5) {
    insights.push({
      headline: "New Moon tonight — the darkest sky this month.",
      detail: "Perfect conditions for the Milky Way, faint nebulae, and meteor watching.",
      icon: "🌑",
      priority: 85,
    });
  }

  // Bright planets
  if (visiblePlanets.includes("jupiter") && visiblePlanets.includes("saturn")) {
    insights.push({
      headline: "Jupiter and Saturn are both visible tonight.",
      detail: "Two gas giants in one sky. Point your phone south to find them.",
      icon: "🪐",
      priority: 70,
      action: "See in Sky Lens",
    });
  } else if (visiblePlanets.includes("venus")) {
    insights.push({
      headline: "Venus is brilliant tonight.",
      detail: "The brightest planet. Look west after sunset — you can't miss it.",
      icon: "💫",
      priority: 65,
      action: "See in Sky Lens",
    });
  } else if (visiblePlanets.includes("mars")) {
    insights.push({
      headline: "Mars is visible tonight.",
      detail: "The Red Planet glows with an unmistakable amber light.",
      icon: "🔴",
      priority: 60,
      action: "See in Sky Lens",
    });
  }

  // Moon high and bright
  if (moonIllumination > 95 && moonAltitude > 20) {
    insights.push({
      headline: "Full Moon tonight — the sky's main character.",
      detail: "Brilliant and commanding. Deep sky objects will be washed out, but the Moon itself is spectacular.",
      icon: "🌕",
      priority: 75,
    });
  }

  // Cloudy = honest
  if (cloudCover > 70) {
    insights.push({
      headline: "Clouds are blocking the view tonight.",
      detail: "Not ideal for stargazing. Explore Planetarium mode instead.",
      icon: "☁️",
      priority: 50,
      action: "Open Planetarium",
    });
  }

  // Sort by priority, return the best one
  insights.sort((a, b) => b.priority - a.priority);

  return insights[0] || {
    headline: "The stars are waiting.",
    detail: "Step outside and look up. AuraLunis will show you what's there.",
    icon: "✨",
    priority: 10,
    action: "Open Sky Lens",
  };
}
