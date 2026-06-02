import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decryptVault, encryptVault, isEncrypted } from "@/services/VaultEncryption";

const VAULT_STORAGE_KEY = "chronaura.vault.prototype.v2";

export type VaultItemType = "note" | "lifesky" | "capture" | "seal" | "lesson" | "archive";

export type VaultItem = {
  id: string;
  type: VaultItemType;
  title: string;
  detail: string;
  createdAtISO: string;
};

type VaultContextValue = {
  items: VaultItem[];
  hydrated: boolean;
  addItem: (item: Omit<VaultItem, "id" | "createdAtISO">) => void;
  addNote: (detail: string) => void;
  clearPrototypeVault: () => Promise<void>;
};

const VaultContext = createContext<VaultContextValue | undefined>(undefined);
const validItemTypes = new Set<VaultItemType>([
  "note",
  "lifesky",
  "capture",
  "seal",
  "lesson",
  "archive"
]);

function sanitizeVaultItems(value: unknown): VaultItem[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is VaultItem => {
    if (!item || typeof item !== "object") return false;

    const candidate = item as Partial<VaultItem>;

    return (
      typeof candidate.id === "string" &&
      typeof candidate.type === "string" &&
      validItemTypes.has(candidate.type as VaultItemType) &&
      typeof candidate.title === "string" &&
      typeof candidate.detail === "string" &&
      typeof candidate.createdAtISO === "string"
    );
  });
}

export function ChronauraVaultProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const saved = await AsyncStorage.getItem(VAULT_STORAGE_KEY);

        if (active && saved) {
          const decrypted = await decryptVault(saved);
          if (decrypted) {
            const parsed = sanitizeVaultItems(JSON.parse(decrypted));
            setItems(parsed);

            // Seamless migration: re-encrypt any unencrypted legacy data.
            if (!isEncrypted(saved)) {
              const encrypted = await encryptVault(JSON.stringify(parsed));
              await AsyncStorage.setItem(VAULT_STORAGE_KEY, encrypted);
            }
          }
        }
      } catch {
        // Keep a blank local prototype Vault if storage is corrupt or unavailable.
      } finally {
        if (active) setHydrated(true);
      }
    }

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    encryptVault(JSON.stringify(items))
      .then((encrypted) => AsyncStorage.setItem(VAULT_STORAGE_KEY, encrypted))
      .catch(() => {
        // No-op in preview/test environments.
      });
  }, [hydrated, items]);

  const value = useMemo<VaultContextValue>(() => {
    const addItem = (item: Omit<VaultItem, "id" | "createdAtISO">) => {
      const now = new Date().toISOString();

      setItems((previous) => [
        {
          ...item,
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          createdAtISO: now
        },
        ...previous
      ]);
    };

    return {
      items,
      hydrated,
      addItem,
      addNote: (detail) =>
        addItem({
          type: "note",
          title: "Cosmic Note",
          detail
        }),
      clearPrototypeVault: async () => {
        setItems([]);
        await AsyncStorage.removeItem(VAULT_STORAGE_KEY);
      }
    };
  }, [hydrated, items]);

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useChronauraVault() {
  const context = useContext(VaultContext);

  if (!context) {
    throw new Error("useChronauraVault must be used inside ChronauraVaultProvider");
  }

  return context;
}
