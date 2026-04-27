import * as LocalAuthentication from "expo-local-authentication";
import { useCallback } from "react";

import { useAppLockStore } from "@/store";

export function useAppLock() {
  const enabled = useAppLockStore((s) => s.enabled);
  const method = useAppLockStore((s) => s.method);
  const isLocked = useAppLockStore((s) => s.isLocked);
  const isInitialized = useAppLockStore((s) => s.isInitialized);
  const biometricAvailable = useAppLockStore((s) => s.biometricAvailable);
  const lock = useAppLockStore((s) => s.lock);
  const unlock = useAppLockStore((s) => s.unlock);
  const enableLock = useAppLockStore((s) => s.enableLock);
  const disableLock = useAppLockStore((s) => s.disableLock);
  const changeMethod = useAppLockStore((s) => s.changeMethod);
  const savePin = useAppLockStore((s) => s.savePin);
  const verifyPin = useAppLockStore((s) => s.verifyPin);

  const triggerBiometric = useCallback(async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Mở khóa MoodNote",
        cancelLabel: "Hủy",
        fallbackLabel: "Dùng mã PIN",
        disableDeviceFallback: true,
      });
      if (result.success) {
        unlock();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [unlock]);

  return {
    enabled,
    method,
    isLocked,
    isInitialized,
    biometricAvailable,
    lock,
    unlock,
    enableLock,
    disableLock,
    changeMethod,
    savePin,
    verifyPin,
    triggerBiometric,
  };
}
