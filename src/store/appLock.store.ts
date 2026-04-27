import * as LocalAuthentication from "expo-local-authentication";
import { create } from "zustand";

import { APP_LOCK_CONFIG, type AppLockMethod } from "@/constants/privacy";
import type { AppLockStore } from "@/types";
import { getStorageItem, removeStorageItem, setStorageItem } from "@/utils/storage";

export const useAppLockStore = create<AppLockStore>((set, get) => ({
  enabled: false,
  method: "pin",
  isLocked: false,
  isInitialized: false,
  biometricAvailable: false,
  backgroundedAt: null,

  initialize: async () => {
    const enabled = (await getStorageItem<boolean>(APP_LOCK_CONFIG.ENABLED_KEY)) ?? false;
    const method = (await getStorageItem<AppLockMethod>(APP_LOCK_CONFIG.METHOD_KEY)) ?? "pin";
    const biometricAvailable = await get().checkBiometricAvailability();
    set({ enabled, method, biometricAvailable, isInitialized: true });
  },

  lock: () => set({ isLocked: true }),

  unlock: () => set({ isLocked: false }),

  enableLock: async (method) => {
    await setStorageItem(APP_LOCK_CONFIG.ENABLED_KEY, true);
    await setStorageItem(APP_LOCK_CONFIG.METHOD_KEY, method);
    set({ enabled: true, method });
  },

  disableLock: async () => {
    await setStorageItem(APP_LOCK_CONFIG.ENABLED_KEY, false);
    await removeStorageItem(APP_LOCK_CONFIG.PIN_KEY);
    set({ enabled: false, isLocked: false });
  },

  changeMethod: async (method) => {
    await setStorageItem(APP_LOCK_CONFIG.METHOD_KEY, method);
    set({ method });
  },

  savePin: async (pin) => {
    await setStorageItem(APP_LOCK_CONFIG.PIN_KEY, pin);
  },

  verifyPin: async (pin) => {
    const stored = await getStorageItem<string>(APP_LOCK_CONFIG.PIN_KEY);
    return stored === pin;
  },

  checkBiometricAvailability: async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) return false;
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const available = isEnrolled;
      set({ biometricAvailable: available });
      return available;
    } catch {
      set({ biometricAvailable: false });
      return false;
    }
  },

  onBackground: () => {
    set({ backgroundedAt: Date.now() });
  },

  onForeground: () => {
    const { backgroundedAt, enabled } = get();
    if (enabled && backgroundedAt !== null) {
      const elapsed = Date.now() - backgroundedAt;
      if (elapsed > APP_LOCK_CONFIG.GRACE_PERIOD_MS) {
        set({ isLocked: true });
      }
    }
    set({ backgroundedAt: null });
  },
}));
