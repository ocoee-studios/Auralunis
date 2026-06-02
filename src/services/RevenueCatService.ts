import { Linking, Platform } from "react-native";
import Constants from "expo-constants";
import Purchases, {
  type CustomerInfo,
  type PurchasesPackage
} from "react-native-purchases";
import {
  RevenueCatIds,
  type BillingPeriod,
  type ChronauraPaidTierId,
  getProductForTier
} from "@/features/paywall/MonetizationCatalog";

type ConfigureResult =
  | { status: "configured" }
  | { status: "missing_api_key" }
  | { status: "unsupported_platform" };

let configured = false;

function getPublicApiKey() {
  const extra = Constants.expoConfig?.extra ?? {};

  if (Platform.OS === "ios") {
    return extra.revenueCatIosApiKey as string | undefined;
  }

  if (Platform.OS === "android") {
    return extra.revenueCatAndroidApiKey as string | undefined;
  }

  return undefined;
}

function isPlaceholderKey(value?: string) {
  return !value || value.startsWith("REPLACE_WITH_");
}

export async function configureRevenueCat(): Promise<ConfigureResult> {
  if (configured) return { status: "configured" };
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return { status: "unsupported_platform" };
  }

  const apiKey = getPublicApiKey();

  if (isPlaceholderKey(apiKey)) {
    return { status: "missing_api_key" };
  }

  const publicApiKey = apiKey as string;
  Purchases.configure({ apiKey: publicApiKey });
  configured = true;

  return { status: "configured" };
}

export async function getCurrentPackages(): Promise<PurchasesPackage[]> {
  const configuration = await configureRevenueCat();

  if (configuration.status !== "configured") return [];

  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

export async function purchaseChronauraTier(
  tierId: ChronauraPaidTierId,
  billingPeriod: BillingPeriod
): Promise<{
  status: "purchased" | "cancelled" | "not_configured" | "not_available";
  customerInfo?: CustomerInfo;
  productId?: string;
}> {
  const product = getProductForTier(tierId, billingPeriod);

  if (!product || !product.availableAtLaunch) {
    return { status: "not_available", productId: product?.productId };
  }

  const configuration = await configureRevenueCat();

  if (configuration.status !== "configured") {
    return { status: "not_configured", productId: product.productId };
  }

  const packages = await getCurrentPackages();
  const selectedPackage = packages.find(
    (candidate) =>
      candidate.identifier === product.revenueCatPackageId ||
      candidate.product.identifier === product.productId
  );

  if (!selectedPackage) {
    return { status: "not_available", productId: product.productId };
  }

  try {
    const result = await Purchases.purchasePackage(selectedPackage);
    return {
      status: "purchased",
      customerInfo: result.customerInfo,
      productId: product.productId
    };
  } catch (error) {
    const candidate = error as { userCancelled?: boolean };

    if (candidate.userCancelled) {
      return { status: "cancelled", productId: product.productId };
    }

    throw error;
  }
}

export async function restoreChronauraPurchases(): Promise<{
  status: "restored" | "not_configured";
  customerInfo?: CustomerInfo;
}> {
  const configuration = await configureRevenueCat();

  if (configuration.status !== "configured") {
    return { status: "not_configured" };
  }

  const customerInfo = await Purchases.restorePurchases();
  return { status: "restored", customerInfo };
}

export async function openChronauraSubscriptionManagement(): Promise<{
  status: "opened" | "missing_url" | "not_configured";
}> {
  const configuration = await configureRevenueCat();

  if (configuration.status !== "configured") {
    return { status: "not_configured" };
  }

  const customerInfo = await Purchases.getCustomerInfo();
  const managementURL = customerInfo.managementURL;

  if (!managementURL) return { status: "missing_url" };

  await Linking.openURL(managementURL);
  return { status: "opened" };
}

export function hasChronauraEntitlement(
  customerInfo: CustomerInfo,
  entitlementId:
    | typeof RevenueCatIds.entitlements.horizonPlus
    | typeof RevenueCatIds.entitlements.auraPro
    | typeof RevenueCatIds.entitlements.sovereign
) {
  return Boolean(customerInfo.entitlements.active[entitlementId]);
}
