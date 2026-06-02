# Chronaura Typography and Font Handoff

Generated: 2026-05-30T01:01:55+00:00

## Important packaging note

Font binaries are **not redistributed** inside this handoff. The ops team should
obtain the approved fonts from their official licensed source, confirm the
license for commercial app distribution, and add them during native integration.

The current React Native scaffold remains usable because it falls back to the
platform system font when custom fonts have not yet been installed.

## Approved premium typography direction

| Usage | Typeface direction | Suggested weights |
|---|---|---|
| Brand headings, celestial names, premium display text | Cinzel | Regular |
| UI labels, cards, buttons, navigation, body text | Montserrat | Light, Regular, Medium, SemiBold, Bold |
| Technical coordinates and compact metrics | Platform monospace or a separately licensed mono font | Regular, Medium |

## Ops integration target

Create this folder in the native app source after the licensed files are obtained:

```text
assets/fonts/
├── Cinzel-Regular.ttf
├── Montserrat-Light.ttf
├── Montserrat-Regular.ttf
├── Montserrat-Medium.ttf
├── Montserrat-SemiBold.ttf
└── Montserrat-Bold.ttf
```

Then load them with the Expo font-loading approach chosen by the engineering team
and map them into the Chronaura theme layer.

## What is already in this handoff

- Brand and UI direction
- Logo files
- App source
- Theme tokens
- Typography manifest
- Integration notes
- No unlicensed or redistributable font binary files
