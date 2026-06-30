import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decryptVault, encryptVault, isEncrypted } from "@/services/VaultEncryption";

const VAULT_STORAGE_KEY = "auralunis.vault.prototype.v2";

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

export function AuraLunisVaultProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  // True when stored data existed but couldn't be decrypted/parsed. While this is set
  // AND the in-memory Vault is empty, we must NOT auto-persist — encrypting [] would
  // clobber the (possibly recoverable) ciphertext on disk. A real user add clears it.
  const loadFailedRef = useRef(false);

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
          } else {
            // Stored data exists but decrypt/parse failed — protect it from being
            // overwritten by the empty in-memory Vault.
            loadFailedRef.current = true;
          }
        }
      } catch {
        // Corrupt/unavailable storage — keep a blank local Vault but guard existing data.
        loadFailedRef.current = true;
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
    // Never persist an empty Vault over data we failed to load (silent data loss).
    if (loadFailedRef.current && items.length === 0) return;

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

export function useAuraLunisVault() {
  const context = useContext(VaultContext);

  if (!context) {
    throw new Error("useAuraLunisVault must be used inside AuraLunisVaultProvider");
  }

  return context;
}
