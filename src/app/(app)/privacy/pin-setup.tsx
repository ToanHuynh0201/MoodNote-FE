import { PinInput } from "@/components/ui/inputs/PinInput";
import { APP_LOCK_CONFIG } from "@/constants/privacy";
import { useAppLock, useThemeColors } from "@/hooks";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { ThemeColors } from "@/theme";
import { s, vs } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";

type Phase = "enter" | "confirm";

export default function PinSetupScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = params.mode === "change" ? "change" : "setup";

  const { savePin, enableLock } = useAppLock();

  const [phase, setPhase] = useState<Phase>("enter");
  const [firstPin, setFirstPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFirstPinChange = useCallback(
    (value: string) => {
      setFirstPin(value);
      if (value.length === APP_LOCK_CONFIG.PIN_LENGTH) {
        setPhase("confirm");
      }
    },
    [],
  );

  const handleConfirmPinChange = useCallback(
    async (value: string) => {
      setConfirmPin(value);
      if (value.length < APP_LOCK_CONFIG.PIN_LENGTH) return;

      if (value !== firstPin) {
        setError("Mã PIN không khớp. Vui lòng thử lại.");
        setConfirmPin("");
        setFirstPin("");
        setPhase("enter");
        return;
      }

      setIsSubmitting(true);
      try {
        await savePin(value);
        if (mode === "setup") {
          await enableLock("pin");
        }
        router.back();
      } finally {
        setIsSubmitting(false);
      }
    },
    [firstPin, mode, savePin, enableLock],
  );

  const handleBack = useCallback(() => {
    if (phase === "confirm") {
      setPhase("enter");
      setFirstPin("");
      setConfirmPin("");
      setError(null);
    } else {
      router.back();
    }
  }, [phase]);

  return (
    <ScreenWrapper padded={false}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          hitSlop={8}
          accessibilityLabel="Quay lại"
          accessibilityRole="button">
          <Ionicons name="arrow-back" size={s(24)} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {mode === "change" ? "Đổi mã PIN" : "Thiết lập mã PIN"}
        </Text>
        <View style={{ width: s(24) }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>
          {phase === "enter" ? "Nhập mã PIN mới" : "Nhập lại mã PIN để xác nhận"}
        </Text>
        <Text style={styles.subtitle}>
          {phase === "enter"
            ? `Chọn ${APP_LOCK_CONFIG.PIN_LENGTH} chữ số để bảo vệ ứng dụng`
            : "Nhập lại mã PIN vừa tạo"}
        </Text>

        {phase === "enter" ? (
          <PinInput
            key="enter"
            value={firstPin}
            onChange={handleFirstPinChange}
            autoFocus
            error={false}
          />
        ) : (
          <PinInput
            key="confirm"
            value={confirmPin}
            onChange={handleConfirmPinChange}
            autoFocus
            error={error !== null}
          />
        )}

        {error !== null && <Text style={styles.errorText}>{error}</Text>}

        {isSubmitting && (
          <Text style={styles.savingText}>Đang lưu...</Text>
        )}
      </View>
    </ScreenWrapper>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SPACING[20],
      paddingVertical: SPACING[16],
    },
    headerTitle: {
      fontSize: FONT_SIZE[17],
      fontWeight: "600",
      color: colors.text.primary,
    },
    body: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: SPACING[32],
      paddingTop: vs(48),
      gap: SPACING[24],
    },
    title: {
      fontSize: FONT_SIZE[22],
      fontWeight: "700",
      color: colors.text.primary,
      textAlign: "center",
    },
    subtitle: {
      fontSize: FONT_SIZE[14],
      lineHeight: LINE_HEIGHT.relaxed,
      color: colors.text.secondary,
      textAlign: "center",
    },
    errorText: {
      fontSize: FONT_SIZE[13],
      color: colors.status.error,
      textAlign: "center",
      backgroundColor: colors.status.errorBackground,
      paddingHorizontal: SPACING[12],
      paddingVertical: SPACING[8],
      borderRadius: RADIUS.sm,
    },
    savingText: {
      fontSize: FONT_SIZE[13],
      color: colors.text.muted,
    },
  });
}
