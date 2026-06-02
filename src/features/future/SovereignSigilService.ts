import * as Crypto from "expo-crypto";
import type {
  SovereignSigilRender,
  SovereignSigilVectorPath
} from "@/features/future/SovereignSigilTypes";

function coordinate(hex: string, index: number, range: number) {
  const pair = hex.slice(index, index + 2) || "00";
  return (parseInt(pair, 16) / 255) * range;
}

function buildPath(hex: string, index: number): SovereignSigilVectorPath {
  const start = index * 8;
  const x1 = 18 + coordinate(hex, start, 84);
  const y1 = 18 + coordinate(hex, start + 2, 84);
  const x2 = 18 + coordinate(hex, start + 4, 84);
  const y2 = 18 + coordinate(hex, start + 6, 84);
  const cx = 60;
  const cy = 60;

  return {
    id: `sigil-path-${index}`,
    d: `M ${cx} ${cy} Q ${x1.toFixed(1)} ${y1.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,
    strokeWidth: 0.8 + (index % 3) * 0.45,
    opacity: 0.45 + (index % 4) * 0.12
  };
}

export async function generateSovereignSigilPreview(
  localSalt: string,
  normalizedBirthSkyHash: string,
  nonce: number
): Promise<SovereignSigilRender> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${localSalt}|${normalizedBirthSkyHash}|${nonce}`
  );

  return {
    id: `sovereign-sigil-${digest.slice(0, 12)}`,
    seedFingerprint: digest.slice(0, 16),
    paths: Array.from({ length: 8 }, (_, index) => buildPath(digest, index)),
    palette: "midnight_gold",
    exportFormat: "widget_vector"
  };
}
