// AI Sky Companion — uses the Anthropic API to answer sky questions
// with real context from the user's location + tonight's ephemeris.
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

export interface SkyQuestion {
  question: string;
  location: ObserverLocation;
  timestamp: Date;
}

export interface SkyAnswer {
  answer: string;
  source: "ai" | "local";
}

function buildSkyContext(location: ObserverLocation): string {
  const sky = computeTonightSky(location);
  const visible = sky.visibleBodies
    .filter(b => b.id !== "sun")
    .map(b => `${b.name}: az ${Math.round(b.azimuthDegrees)}° alt ${Math.round(b.altitudeDegrees)}°`)
    .join(", ");
  return `Observer at lat ${location.latitudeDegrees.toFixed(2)}, lon ${location.longitudeDegrees.toFixed(2)}. ` +
    `Moon: ${sky.moonIlluminationPercent}% illuminated. ` +
    `Visible bodies: ${visible || "none above horizon"}. ` +
    `Time: ${new Date().toISOString()}.`;
}

export async function askSkyCompanion(
  question: string,
  location: ObserverLocation,
  apiKey?: string
): Promise<SkyAnswer> {
  if (!apiKey) {
    return { answer: "Sky Companion requires an API key. Add it in Settings.", source: "local" };
  }

  const context = buildSkyContext(location);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: `You are Chronaura's Sky Companion — a warm, knowledgeable astronomy guide. Answer concisely (2-4 sentences). Use the observer's real sky data: ${context}`,
        messages: [{ role: "user", content: question }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "I couldn't read the sky right now. Try again.";
    return { answer: text, source: "ai" };
  } catch {
    return { answer: "Couldn't connect to the Sky Companion. Check your connection.", source: "local" };
  }
}
