import { PinInput } from "@/components/ui/inputs/PinInput";
import { APP_LOCK_CONFIG } from "@/constants/privacy";
import { useAppLock } from "@/hooks";
import { useThemeColors } from "@/hooks";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { ThemeColors } from "@/theme";
import { s, vs } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

export function LockScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isLocked, method, biometricAvailable, triggerBiometric, verifyPin } = useAppLock();

  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPinFallback, setShowPinFallback] = useState(false);

  const showPin = method === "pin" || showPinFallback;

  const handleBiometric = useCallback(async () => {
    const success = await triggerBiometric();
    if (!success && method === "biometric") {
      setShowPinFallback(false);
    }
  }, [triggerBiometric, method]);

  useEffect(() => {
    if (isLocked && method === "biometric" && biometricAvailable) {
      void handleBiometric();
    }
  }, [isLocked]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isLocked) {
      setPin("");
      setError(null);
      setShowPinFallback(false);
      setIsVerifying(false);
    }
  }, [isLocked]);

  useEffect(() => {
    if (pin.length === APP_LOCK_CONFIG.PIN_LENGTH) {
      void handlePinSubmit(pin);
    }
  }, [pin]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePinSubmit = useCallback(async (candidate: string) => {
    setIsVerifying(true);
    const ok = await verifyPin(candidate);
    setIsVerifying(false);
    if (ok) {
      setPin("");
      setError(null);
    } else {
      setError("Mã PIN không đúng. Vui lòng thử lại.");
      setPin("");
    }
  }, [verifyPin]);

  if (!isLocked) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <Ionicons name="lock-closed" size={s(48)} color={colors.brand.primary} />
        <Text style={styles.title}>MoodNote bị khóa</Text>

        {!showPin && method === "biometric" && (
          <>
            <Text style={styles.subtitle}>Xác thực để mở khóa</Text>
            <Pressable
              style={styles.biometricButton}
              onPress={handleBiometric}
              accessibilityLabel="Mở khóa bằng sinh trắc học"
              accessibilityRole="button">
              <Ionicons name="finger-print-outline" size={s(32)} color={colors.text.inverse} />
              <Text style={styles.biometricButtonText}>Dùng Face ID / Touch ID</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowPinFallback(true)}
              accessibilityLabel="Dùng mã PIN thay thế"
              accessibilityRole="button">
              <Text style={styles.fallbackText}>Dùng mã PIN</Text>
            </Pressable>
          </>
        )}

        {showPin && (
          <>
            <Text style={styles.subtitle}>Nhập mã PIN của bạn</Text>
            {isVerifying ? (
              <ActivityIndicator color={colors.brand.primary} style={styles.spinner} />
            ) : (
              <PinInput
                value={pin}
                onChange={setPin}
                error={error !== null}
                autoFocus
              />
            )}
            {error !== null && <Text style={styles.errorText}>{error}</Text>}
            {method === "biometric" && biometricAvailable && (
              <Pressable
                onPress={() => {
                  setShowPinFallback(false);
                  void handleBiometric();
                }}
                accessibilityLabel="Dùng sinh trắc học thay thế"
                accessibilityRole="button">
                <Text style={styles.fallbackText}>Dùng Face ID / Touch ID</Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.background.primary,
      zIndex: 9999,
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      alignItems: "center",
      paddingHorizontal: SPACING[32],
      gap: SPACING[20],
    },
    title: {
      fontSize: FONT_SIZE[22],
      fontWeight: "700",
      color: colors.text.primary,
      textAlign: "center",
    },
    subtitle: {
      fontSize: FONT_SIZE[15],
      lineHeight: LINE_HEIGHT.relaxed,
      color: colors.text.secondary,
      textAlign: "center",
    },
    biometricButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING[12],
      backgroundColor: colors.brand.primary,
      paddingHorizontal: SPACING[24],
      paddingVertical: SPACING[14],
      borderRadius: RADIUS.lg,
    },
    biometricButtonText: {
      fontSize: FONT_SIZE[15],
      fontWeight: "600",
      color: colors.text.inverse,
    },
    fallbackText: {
      fontSize: FONT_SIZE[14],
      color: colors.text.link,
      marginTop: SPACING[4],
    },
    errorText: {
      fontSize: FONT_SIZE[13],
      color: colors.status.error,
      textAlign: "center",
    },
    spinner: {
      marginVertical: vs(20),
    },
  });
}
