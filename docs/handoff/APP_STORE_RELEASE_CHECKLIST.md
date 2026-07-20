# App Store Release Checklist

## Code validation
- [ ] `npm install`
- [ ] `npx expo install --fix`
- [ ] `npm run typecheck`
- [ ] `npm run doctor`
- [ ] iOS simulator build
- [ ] physical iPhone build
- [ ] physical-device Sky Lens tests
- [ ] reduced-transparency tests
- [ ] reduced-motion tests
- [ ] VoiceOver review
- [ ] readable contrast over star fields

## Billing
- [ ] App Store Connect products created
- [ ] RevenueCat configured
- [ ] `AuraLunis Premium` entitlement verified
- [ ] monthly purchase verified ($9.99)
- [ ] annual purchase verified ($49.99)
- [ ] lifetime purchase verified ($129.99)
- [ ] intro-trial eligibility verified (7-day trial shown on monthly/annual only when Apple confirms eligibility)
- [ ] restore verified
- [ ] cancellation and renewal copy verified
- [ ] Manage Subscription verified

## Legal
- [ ] Privacy Policy published
- [ ] Terms of Use published
- [ ] Support page published
- [ ] Paywall footer links work
- [ ] Settings legal links work
- [ ] App Privacy answers complete
- [ ] SDK and permission inventory complete
- [ ] legal review complete

## Native extensions
- [ ] WidgetKit target added
- [ ] notifications tested
- [ ] Sky Lens capture (screenshot of the rendered view) save flow tested

## Release
- [ ] TestFlight internal test
- [ ] TestFlight external test
- [ ] App Store screenshots
- [ ] App Store description
- [ ] support URL
- [ ] privacy URL
- [ ] final review notes
