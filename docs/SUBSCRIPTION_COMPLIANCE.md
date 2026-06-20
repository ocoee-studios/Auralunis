# AuraLunis — Apple Subscription Compliance

## Required by Apple (App Review Guidelines 3.1.2)

### Restore Purchases button
- [x] Present on the Membership screen
- [x] Calls `Purchases.restorePurchases()` via RevenueCat
- [x] Shows confirmation alert on success/failure
- Location: Settings → Manage Plan → Restore Purchases

### Subscription management deep link
- [x] "Manage Subscription" button links to Apple Settings
- [x] Uses `Linking.openURL('https://apps.apple.com/account/subscriptions')`
- Location: Settings → Manage Plan → Manage Subscription

### Auto-renewable disclosures (required on paywall)
The paywall must clearly state:
- [x] Price per billing period ($6.99/month or $39.99/year)
- [x] Free trial duration (7 days)
- [x] "Payment will be charged to your Apple ID account at the confirmation of purchase"
- [x] "Subscription automatically renews unless cancelled at least 24 hours before the end of the current period"
- [x] Links to Terms of Use and Privacy Policy

### Terms of Use link
- Must be accessible from the paywall
- Must be accessible from Settings
- URL: ocoeestudios.com/auralunis/terms

### Privacy Policy link
- Must be accessible from the paywall
- Must be accessible from Settings
- Must be entered in App Store Connect
- URL: ocoeestudios.com/auralunis/privacy

## RevenueCat Product IDs

| Product | ID | Type |
|---|---|---|
| Premium Monthly | `com.ocoee.auralunis.premium.monthly` | Auto-renewable |
| Premium Annual | `com.ocoee.auralunis.premium.annual` | Auto-renewable |

## Entitlement
`auralunis_premium` — grants access to all premium features.

## Offering
`default` — contains both monthly and annual packages.

## Free trial
Both products include a 7-day introductory free trial.
Configure in App Store Connect → In-App Purchases → each product → Introductory Offer.

## Sandbox testing
1. Create a sandbox Apple ID in App Store Connect → Users and Access → Sandbox Testers
2. Sign out of your real Apple ID on the test device
3. Attempt purchase in the app — it will prompt for sandbox credentials
4. Sandbox subscriptions renew at accelerated rates (monthly = 5 min, annual = 1 hour)

## Grace period
Enable Billing Grace Period in App Store Connect → App → Subscriptions → Billing Grace Period.
This gives users 6-16 days to fix payment issues before losing access.
