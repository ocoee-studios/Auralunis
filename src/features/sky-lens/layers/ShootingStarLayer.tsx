// ShootingStarLayer.tsx — rare shooting stars across the sky
// One every 8-12 minutes. Fast, tiny, unforgettable.
// "People will tell friends."

import React, { useEffect, useRef, useState } from "react";
import { G, Line } from "react-native-svg";
import { onRareEvent } from "@/services/HapticDiscoveryService";

type Props = {
  width: number;
  height: number;
  nightMode: boolean;
};

interface Meteor {
  id: number;
  x1: number; y1: number;
  x2: number; y2: number;
  opacity: number;
  progress: number; // 0→1
}

export function ShootingStarLayer({ width, height, nightMode }: Props) {
  const [meteor, setMeteor] = useState<Meteor | null>(null);
  const idRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    function scheduleMeteor() {
      // Random delay: 8-12 minutes (480-720 seconds)
      const delay = (480 + Math.random() * 240) * 1000;
      const timer = setTimeout(() => {
        fireMeteor();
        scheduleMeteor();
      }, delay);
      return timer;
    }

    // First meteor in 30-90 seconds so user sees one quickly
    const firstTimer = setTimeout(() => {
      fireMeteor();
    }, (30 + Math.random() * 60) * 1000);

    const recurringTimer = scheduleMeteor();

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(recurringTimer);
    };
  }, []);

  function fireMeteor() {
    const id = ++idRef.current;
    // Random start point (upper 60% of sky)
    const x1 = Math.random() * width;
    const y1 = Math.random() * height * 0.6;
    // Random direction and length (100-200px streak)
    const angle = Math.PI * 0.15 + Math.random() * Math.PI * 0.4; // mostly downward
    const len = 100 + Math.random() * 120;
    const x2 = x1 + Math.cos(angle) * len;
    const y2 = y1 + Math.sin(angle) * len;

    const m: Meteor = { id, x1, y1, x2, y2, opacity: 0, progress: 0 };
    setMeteor(m);
    onRareEvent(); // haptic pulse

    // Animate: quick fade in, streak across, fade out (600ms total)
    const start = Date.now();
    const duration = 600;
    function animate() {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      const opacity = t < 0.2 ? t / 0.2 : t > 0.7 ? (1 - t) / 0.3 : 1;
      setMeteor(prev => prev && prev.id === id ? { ...prev, progress: t, opacity } : prev);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setMeteor(null);
      }
    }
    frameRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  if (!meteor || meteor.opacity <= 0) return null;

  const t = meteor.progress;
  // The streak moves: head at progress point, tail trails behind
  const headX = meteor.x1 + (meteor.x2 - meteor.x1) * t;
  const headY = meteor.y1 + (meteor.y2 - meteor.y1) * t;
  const tailT = Math.max(0, t - 0.3);
  const tailX = meteor.x1 + (meteor.x2 - meteor.x1) * tailT;
  const tailY = meteor.y1 + (meteor.y2 - meteor.y1) * tailT;

  const color = nightMode ? "#FF6B4A" : "#FFFDE8";

  return (
    <G>
      {/* Faint wide trail */}
      <Line
        x1={tailX} y1={tailY} x2={headX} y2={headY}
        stroke={color} strokeWidth={3} strokeOpacity={meteor.opacity * 0.15}
        strokeLinecap="round"
      />
      {/* Bright core streak */}
      <Line
        x1={tailX} y1={tailY} x2={headX} y2={headY}
        stroke={color} strokeWidth={1.2} strokeOpacity={meteor.opacity * 0.8}
        strokeLinecap="round"
      />
    </G>
  );
}
