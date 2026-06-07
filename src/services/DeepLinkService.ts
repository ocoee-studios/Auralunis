// Handles deep links from widgets, notifications, and universal links.
// Maps incoming URLs/payloads to the correct screen.

export type DeepLinkTarget =
  | { screen: "home" }
  | { screen: "tonight" }
  | { screen: "sky" }
  | { screen: "learn"; category?: string }
  | { screen: "vault" }
  | { screen: "settings" }
  | { screen: "membership" };

export function parseDeepLink(url: string): DeepLinkTarget {
  if (url.includes("tonight")) return { screen: "tonight" };
  if (url.includes("sky")) return { screen: "sky" };
  if (url.includes("vault")) return { screen: "vault" };
  if (url.includes("learn")) return { screen: "learn" };
  if (url.includes("membership")) return { screen: "membership" };
  if (url.includes("settings")) return { screen: "settings" };
  return { screen: "home" };
}

export function parseNotificationPayload(data: Record<string, unknown>): DeepLinkTarget {
  const type = data.type as string;
  if (type === "sunset" || type === "moonrise") return { screen: "tonight" };
  if (type === "iss_pass") return { screen: "sky" };
  if (type === "eclipse" || type === "conjunction") return { screen: "tonight" };
  return { screen: "home" };
}
