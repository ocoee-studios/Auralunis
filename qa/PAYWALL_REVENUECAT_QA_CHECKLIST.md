# AuraLunis Paywall + RevenueCat QA Checklist

Tester:
Build:
Sandbox account:
Date:

## First-open paywall
- [ ] Three-tier paywall opens on fresh install
- [ ] Horizon Free button dismisses paywall
- [ ] Monthly / Annual toggle works
- [ ] Horizon+ monthly displays $2.99/month
- [ ] Horizon+ annual displays $19.99/year
- [ ] Aura Pro monthly displays $5.99/month
- [ ] Aura Pro annual displays $49.99/year
- [ ] Aura Pro is visually emphasized
- [ ] Sovereign displays $299/year
- [ ] Sovereign says waitlist / coming later
- [ ] Sovereign cannot trigger an App Store purchase
- [ ] Restore Purchases button is visible
- [ ] Trial copy says eligible new subscribers

## App Store Connect
- [ ] One `AuraLunis Memberships` subscription group exists
- [ ] Horizon+ products are Level 3
- [ ] Aura Pro products are Level 2
- [ ] Sovereign product is Level 1
- [ ] Monthly and annual products of each tier share the same level
- [ ] 7-day introductory free trial configured on all paid products
- [ ] Product metadata is available in sandbox

## RevenueCat
- [ ] `horizon_plus` entitlement exists
- [ ] `aura_pro` entitlement exists
- [ ] `sovereign` entitlement exists
- [ ] `auralunis_launch` offering exists
- [ ] Horizon+ and Aura Pro launch packages appear in current offering
- [ ] Sovereign package is withheld from public launch offering
- [ ] Public iOS SDK key added to app config

## Sandbox purchase flow
- [ ] Horizon+ monthly purchase works
- [ ] Horizon+ annual purchase works
- [ ] Aura Pro monthly purchase works
- [ ] Aura Pro annual purchase works
- [ ] Purchase cancellation leaves user in free tier
- [ ] Restore Purchases refreshes entitlement
- [ ] Manage Subscription opens App Store subscription-management URL
- [ ] Trial terms appear only when sandbox user is eligible
- [ ] Second trial is not falsely promised after prior group trial use

## Result
- [ ] PASS
- [ ] BLOCKED — attach issue log
