export const APP_LOCK_CONFIG = {
  ENABLED_KEY: "moodnote_app_lock_enabled",
  METHOD_KEY: "moodnote_app_lock_method",
  PIN_KEY: "moodnote_app_lock_pin",
  GRACE_PERIOD_MS: 30_000,
  PIN_LENGTH: 6,
} as const;

export type AppLockMethod = "biometric" | "pin";
