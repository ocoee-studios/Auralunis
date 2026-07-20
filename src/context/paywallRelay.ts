// Pure relay model for the paywall "open request" flag (PaywallNavigationContext.isPaywallVisible).
// No react / native imports, so it is unit-testable in plain Node (see scripts/paywall-reopen-selftest.js).
//
// The flag is a ONE-SHOT request: when set, PaywallBridge opens the modal AND immediately clears
// the request, so a later openPaywall() from ANY caller re-triggers a fresh open. Previously the
// flag stuck at true and PaywallBridge's `[isPaywallVisible]` effect only fired on the first
// false→true transition — so only the first paywall open per app session ever worked.

export interface PaywallRelayEffect {
  /** Show the modal (relay to App's local `paywallVisible`). */
  openModal: boolean;
  /** Clear the context request flag so the next openPaywall() re-fires. */
  clearRequest: boolean;
}

/** Given the current open-request flag, what the bridge should do this tick. */
export function relayPaywallRequest(requestOpen: boolean): PaywallRelayEffect {
  return { openModal: requestOpen, clearRequest: requestOpen };
}
