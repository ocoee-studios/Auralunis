// Captures a React Native view as an image and shares it.
let ViewShot: { captureRef: (ref: unknown, opts: object) => Promise<string> } | null = null;
let Sharing: { shareAsync: (url: string) => Promise<void> } | null = null;

try {
  ViewShot = require("react-native-view-shot") as typeof ViewShot;
  Sharing = require("expo-sharing") as typeof Sharing;
} catch { /* Will fail gracefully */ }

export async function captureAndShare(viewRef: unknown): Promise<boolean> {
  if (!ViewShot || !Sharing) return false;
  try {
    const uri = await ViewShot.captureRef(viewRef, {
      format: "png",
      quality: 1,
      result: "tmpfile"
    });
    await Sharing.shareAsync(uri, {
      mimeType: "image/png",
      dialogTitle: "Share Tonight's Sky"
    });
    return true;
  } catch {
    return false;
  }
}
