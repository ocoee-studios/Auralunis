import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AuraLunisColors } from "@/theme/tokens";

export function TermsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>AuraLunis Terms of Use</Text>
      <Text style={styles.updated}>Last updated: June 2026</Text>

      <Text style={styles.body}>
        By using AuraLunis, you agree to these terms. If you do not agree, do not use the app.
      </Text>

      <Text style={styles.heading}>Description</Text>
      <Text style={styles.body}>
        AuraLunis is a premium interactive astronomy app that transforms your iPhone into a living celestial instrument. Features include a sensor-aligned sky planetarium, satellite tracking, constellation charts, and astrophotography planning. Your observations stay on your device.
      </Text>

      <Text style={styles.heading}>Subscriptions</Text>
      <Text style={styles.body}>
        Free: Celestial Dial, basic sky view, 10 constellations, ISS tracking, Learn section.{"\n\n"}
        Premium ($9.99/month or $49.99/year): Full Sky Lens planetarium, 35 major constellations with mythology, live satellite tracking, Birth Sky, Astro Weather, Astrophotography Planner, Night Vision, sky-quality presets, encrypted vault.{"\n\n"}
        Lifetime ($129.99 one-time): all Premium features permanently, including future updates. No subscription.
      </Text>

      <Text style={styles.heading}>Billing</Text>
      <Text style={styles.body}>
        • Payment is charged to your Apple ID account at confirmation of purchase{"\n"}
        • Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period{"\n"}
        • Your account will be charged for renewal within 24 hours prior to the end of the current period at the same price{"\n"}
        • You can manage and cancel subscriptions in your Apple ID Account Settings{"\n"}
        • No refunds for partial subscription periods
      </Text>

      <Text style={styles.heading}>Accuracy & Safety</Text>
      <Text style={styles.body}>
        AuraLunis provides astronomical data for educational and recreational purposes. Celestial positions, satellite predictions, and weather forecasts are approximations and should not be relied upon for navigation, aviation, or safety-critical decisions. Always be aware of your surroundings when using Sky Lens outdoors, especially at night.
      </Text>

      <Text style={styles.heading}>Your Content</Text>
      <Text style={styles.body}>
        You own everything you create in AuraLunis. We claim no rights to your observations, notes, vault entries, or any content you create within the app.
      </Text>

      <Text style={styles.heading}>Acceptable Use</Text>
      <Text style={styles.body}>
        Do not use AuraLunis to store illegal content or to violate the rights of others.
      </Text>

      <Text style={styles.heading}>Disclaimer</Text>
      <Text style={styles.body}>
        AuraLunis is provided "as is" without warranties of any kind. Ocoee Studios is not liable for any loss of data, observations, or creative work. Back up important content regularly using the export feature.
      </Text>

      <Text style={styles.heading}>Limitation of Liability</Text>
      <Text style={styles.body}>
        To the maximum extent permitted by law, Ocoee Studios shall not be liable for any indirect, incidental, special, or consequential damages.
      </Text>

      <Text style={styles.heading}>Governing Law</Text>
      <Text style={styles.body}>
        These terms are governed by the laws of the State of Tennessee, United States.
      </Text>

      <Text style={styles.heading}>Contact</Text>
      <Text style={styles.body}>admin@ocoeestudios.com</Text>

      <Text style={styles.heading}>Apple EULA</Text>
      <Text style={styles.body}>
        This agreement is between you and Ocoee Studios, not Apple. Apple has no obligation to furnish maintenance or support services with respect to AuraLunis. To the extent permitted by applicable law, Apple will have no warranty obligation with respect to AuraLunis. Apple is not responsible for addressing any claims relating to AuraLunis. Apple is a third-party beneficiary of this agreement.
      </Text>

      <Text style={styles.footer}>© 2026 Ocoee Studios</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AuraLunisColors.cosmicBlack },
  content: { padding: 20, paddingBottom: 60 },
  title: { color: AuraLunisColors.gold, fontSize: 20, fontWeight: "900", letterSpacing: 1, marginBottom: 4 },
  updated: { color: AuraLunisColors.muted, fontSize: 12, marginBottom: 20 },
  heading: { color: AuraLunisColors.gold, fontSize: 14, fontWeight: "800", marginTop: 20, marginBottom: 6 },
  body: { color: AuraLunisColors.silver, fontSize: 13, lineHeight: 20 },
  footer: { color: AuraLunisColors.faint, fontSize: 11, marginTop: 30, textAlign: "center" },
});
