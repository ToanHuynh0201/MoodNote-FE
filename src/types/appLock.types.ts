import type { AppLockMethod } from "@/constants/privacy";

export interface AppLockSettings {
  enabled: boolean;
  method: AppLockMethod;
}

export interface AppLockStore extends AppLockSettings {
  isLocked: boolean;
  isInitialized: boolean;
  biometricAvailable: boolean;
  backgroundedAt: number | null;

  initialize: () => Promise<void>;
  lock: () => void;
  unlock: () => void;
  enableLock: (method: AppLockMethod) => Promise<void>;
  disableLock: () => Promise<void>;
  changeMethod: (method: AppLockMethod) => Promise<void>;
  savePin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  checkBiometricAvailability: () => Promise<boolean>;
  onBackground: () => void;
  onForeground: () => void;
}
