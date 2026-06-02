declare function require(path: string): any;

declare namespace JSX {
  interface Element {}
  interface ElementChildrenAttribute { children: {} }
  interface IntrinsicAttributes { key?: string | number }
  interface IntrinsicElements { [elemName: string]: any }
}

declare namespace React {
  type ReactNode = any;
  type FC<P = {}> = (props: P) => JSX.Element | null;
}

declare module "react" {
  export type ReactNode = any;
  export type Dispatch<A> = (value: A) => void;
  export type SetStateAction<S> = S | ((previousState: S) => S);
  export interface Context<T> {
    Provider: React.FC<{ value: T; children?: React.ReactNode }>;
  }
  export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useMemo<T>(factory: () => T, deps: readonly any[]): T;
  export function createContext<T>(defaultValue: T): Context<T>;
  export function useContext<T>(context: Context<T>): T;
  const React: { createElement: (...args: any[]) => any };
  export default React;
}

declare module "react-native" {
  import type { FC } from "react";
  export const Alert: { alert: (...args: any[]) => void };
  export const Linking: { openURL(url: string): Promise<void> };
  export const Platform: { OS: string };
  export const Pressable: FC<any>;
  export const Text: FC<any>;
  export const View: FC<any>;
  export const Switch: FC<any>;
  export const TextInput: FC<any>;
  export const ScrollView: FC<any>;
  export const Modal: FC<any>;
  export const Image: FC<any>;
  export const StyleSheet: {
    create<T extends Record<string, any>>(styles: T): T;
    absoluteFillObject: any;
  };
}

declare module "expo-linear-gradient" {
  import type { FC } from "react";
  export const LinearGradient: FC<any>;
}

declare module "expo-camera" {
  import type { FC } from "react";
  export const CameraView: FC<any>;
  export interface PermissionResponse { granted: boolean }
  export function useCameraPermissions(): [PermissionResponse | null, () => Promise<PermissionResponse>];
}

declare module "@react-native-async-storage/async-storage" {
  const AsyncStorage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  };
  export default AsyncStorage;
}

declare module "@react-navigation/native" {
  import type { FC } from "react";
  export const NavigationContainer: FC<any>;
}

declare module "@react-navigation/bottom-tabs" {
  import type { FC } from "react";
  type IconArgs = { color: string; size: number };
  type TabOptions = { tabBarIcon?: (args: IconArgs) => any; [key: string]: any };
  type ScreenOptionsArgs<T> = { route: { name: keyof T } };
  type NavigatorProps<T> = {
    screenOptions?: (args: ScreenOptionsArgs<T>) => TabOptions;
    children?: any;
  };
  type ScreenProps<T> = { name: keyof T; component: any };
  export function createBottomTabNavigator<T>(): {
    Navigator: FC<NavigatorProps<T>>;
    Screen: FC<ScreenProps<T>>;
  };
}

declare module "@expo/vector-icons" {
  import type { FC } from "react";
  export const Ionicons: FC<any> & { glyphMap: Record<string, number> };
}

declare module "react-native-svg" {
  import type { FC } from "react";
  const Svg: FC<any>;
  export const Circle: FC<any>;
  export const Line: FC<any>;
  export const Path: FC<any>;
  export default Svg;
}


declare module "expo-location" {
  export interface PermissionResponse { granted: boolean }
  export interface HeadingObject {
    trueHeading: number;
    magHeading: number;
    accuracy: number;
  }
  export const Accuracy: { Balanced: number };
  export function useForegroundPermissions(): [
    PermissionResponse | null,
    () => Promise<PermissionResponse>
  ];
  export function getForegroundPermissionsAsync(): Promise<PermissionResponse>;
  export function requestForegroundPermissionsAsync(): Promise<PermissionResponse>;
  export function getHeadingAsync(): Promise<HeadingObject>;
  export function hasServicesEnabledAsync(): Promise<boolean>;
}

declare module "expo-media-library" {
  export interface PermissionResponse { granted: boolean }
  export function getPermissionsAsync(writeOnly?: boolean): Promise<PermissionResponse>;
  export function requestPermissionsAsync(writeOnly?: boolean): Promise<PermissionResponse>;
}

declare module "expo-sensors" {
  export const Accelerometer: { isAvailableAsync(): Promise<boolean> };
  export const Gyroscope: { isAvailableAsync(): Promise<boolean> };
  export const Magnetometer: { isAvailableAsync(): Promise<boolean> };
}

declare module "expo-haptics" {
  export enum NotificationFeedbackType {
    Success = "success",
    Warning = "warning",
    Error = "error"
  }
  export function selectionAsync(): Promise<void>;
  export function notificationAsync(type: NotificationFeedbackType): Promise<void>;
}


declare module "expo-constants" {
  const Constants: {
    expoConfig?: {
      extra?: Record<string, unknown>;
    };
  };
  export default Constants;
}


declare module "react-native-purchases" {
  export type PurchasesPackage = {
    identifier: string;
    product: {
      identifier: string;
    };
  };

  export type CustomerInfo = {
    entitlements: {
      active: Record<string, unknown>;
    };
    managementURL?: string | null;
  };

  const Purchases: {
    configure(config: { apiKey: string }): void;
    getOfferings(): Promise<{
      current?: {
        availablePackages: PurchasesPackage[];
      } | null;
    }>;
    purchasePackage(selectedPackage: PurchasesPackage): Promise<{
      customerInfo: CustomerInfo;
    }>;
    restorePurchases(): Promise<CustomerInfo>;
    getCustomerInfo(): Promise<CustomerInfo>;
  };

  export default Purchases;
}


declare module "expo-crypto" {
  export enum CryptoDigestAlgorithm {
    SHA256 = "SHA-256"
  }
  export function digestStringAsync(
    algorithm: CryptoDigestAlgorithm,
    data: string
  ): Promise<string>;
}
