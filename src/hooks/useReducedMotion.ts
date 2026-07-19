import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

// Live "Reduce Motion" system setting (iOS Settings › Accessibility › Motion). Reads the
// current value on mount and updates when the user toggles it, so ambient animations can
// freeze or restart without a remount. Uses only the built-in React Native AccessibilityInfo
// API — no new dependency. Returns a plain boolean.
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    // Async initial read — guard against setting state after unmount.
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduced(value);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (value) => {
      setReduced(value);
    });
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}
