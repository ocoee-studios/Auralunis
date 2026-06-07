# Chronaura — Encryption Export Compliance

## Does Chronaura use encryption?
**Yes.** The Cosmic Vault uses NaCl secretbox (XSalsa20-Poly1305) via the
tweetnacl library for encrypting user journal entries and observations.

## Apple's export compliance questions

When submitting to App Store Connect, you'll be asked:

**"Does your app use encryption?"**
→ **Yes**

**"Does your app qualify for any exemptions?"**
→ **Yes — exemption (b)(1)**

The encryption in Chronaura qualifies for the exemption because:
- It is used solely for **protecting user data on-device** (personal journal entries)
- It does not implement proprietary encryption algorithms
- It uses **standard, published algorithms** (XSalsa20-Poly1305 via NaCl)
- Encryption keys are stored in the iOS Keychain and never transmitted
- No encrypted data is transmitted over the network
- The app does not enable encrypted communication between users

## ITAR/EAR Classification
NaCl/TweetNaCl is open-source, publicly available cryptographic software.
Under EAR §740.13(e), publicly available encryption source code is generally
eligible for License Exception TSU (Technology and Software Unrestricted).

## What to select in App Store Connect
1. "Does your app use encryption?" → **Yes**
2. "Does your app qualify for any of the exemptions provided in Category 5, Part 2 of the U.S. Export Administration Regulations?" → **Yes**
3. "Is your app limited to authentication, digital signature, or data protection?" → **Yes**
4. You do NOT need to submit an annual self-classification report for this exemption.

## Technical details
- Algorithm: XSalsa20-Poly1305 (NaCl secretbox)
- Key length: 256-bit
- Library: tweetnacl (npm)
- Key storage: expo-secure-store (iOS Keychain)
- Data scope: local Vault entries only
- Network transmission of encrypted data: **None**
