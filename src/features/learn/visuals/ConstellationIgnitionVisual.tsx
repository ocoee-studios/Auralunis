import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { AuraLunisColors } from "@/theme/tokens";

export function ConstellationIgnitionVisual() {
  const [on, setOn] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setOn((v) => !v), 1200);
    return () => clearInterval(id);
  }, []);

  const stars = [
    [34, 22], [80, 46], [112, 72], [150, 42], [172, 92], [132, 126], [86, 118]
  ];
  const lines = [[0,1],[1,2],[2,4],[1,3],[2,5],[5,6]];

  return (
    <View style={styles.card}>
      <Text style={styles.label}>CONSTELLATION IGNITION</Text>
      <Svg width={220} height={150} style={{ marginTop: 8, alignSelf: "center" }}>
        {lines.map(([a,b], i) => (
          <Line
            key={i}
            x1={stars[a][0]} y1={stars[a][1]} x2={stars[b][0]} y2={stars[b][1]}
            stroke={on ? AuraLunisColors.gold : "rgba(217,168,78,0.18)"}
            strokeWidth={on ? 1.8 : 1}
          />
        ))}
        {stars.map(([x,y], i) => (
          <Circle key={i} cx={x} cy={y} r={on ? 3.6 : 2.5} fill={on ? "#FFF7D0" : "#C0C6D4"} />
        ))}
      </Svg>
      <Text style={styles.caption}>Stars ignite into golden constellation lines. Production can connect this to any of the 88 official constellations.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 28, padding: 16, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 14 },
  label: { color: AuraLunisColors.gold2, fontSize: 11, letterSpacing: 2, fontWeight: "900" },
  caption: { color: AuraLunisColors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 }
});
