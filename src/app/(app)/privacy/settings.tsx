import { ROUTES } from "@/constants";
import { type AppLockMethod } from "@/constants/privacy";
import { useAppLock, useThemeColors } from "@/hooks";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { ThemeColors } from "@/theme";
import { s } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Divider } from "@/components/ui/display/Divider";
import { ToggleSwitch } from "@/components/ui/inputs/ToggleSwitch";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";

export default function PrivacySettingsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { enabled, method, biometricAvailable, enableLock, disableLock, changeMethod } =
    useAppLock();

  const handleToggleLock = useCallback(
    async (value: boolean) => {
      if (value) {
        if (biometricAvailable) {
          router.push({
            pathname: ROUTES.PRIVACY_PIN_SETUP as never,
            params: { mode: "setup" },
          });
        } else {
          router.push({
            pathname: ROUTES.PRIVACY_PIN_SETUP as never,
            params: { mode: "setup" },
          });
        }
      } else {
        await disableLock();
      }
    },
    [biometricAvailable, disableLock],
  );

  const handleSelectMethod = useCallback(
    async (selected: AppLockMethod) => {
      if (selected === method) return;
      if (selected === "pin") {
        router.push({
          pathname: ROUTES.PRIVACY_PIN_SETUP as never,
          params: { mode: "setup" },
        });
        await changeMethod("pin");
      } else {
        await changeMethod("biometric");
      }
    },
    [method, changeMethod],
  );

  const methodLabel = method === "biometric" ? "Sinh trắc học" : "Mã PIN 6 số";

  return (
    <ScreenWrapper padded={false}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityLabel="Quay lại"
          accessibilityRole="button">
          <Ionicons name="arrow-back" size={s(24)} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Quyền riêng tư</Text>
        <View style={{ width: s(24) }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* App lock toggle */}
        <View style={styles.card}>
          <ToggleSwitch
            label="Khóa ứng dụng"
            sublabel={
              enabled
                ? `Đang bật · ${methodLabel}`
                : "Yêu cầu xác thực khi mở lại ứng dụng"
            }
            value={enabled}
            onValueChange={handleToggleLock}
          />
        </View>

        {/* Lock method selection */}
        {enabled && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Phương thức khóa</Text>

            {biometricAvailable && (
              <>
                <Pressable
                  style={styles.methodRow}
                  onPress={() => handleSelectMethod("biometric")}
                  accessibilityLabel="Sinh trắc học"
                  accessibilityRole="radio">
                  <View style={styles.methodRowLeft}>
                    <Ionicons
                      name="finger-print-outline"
                      size={s(22)}
                      color={colors.iconDefault}
                    />
                    <View>
                      <Text style={styles.methodLabel}>Sinh trắc học</Text>
                      <Text style={styles.methodSublabel}>Face ID / Touch ID</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      method === "biometric" && styles.radioSelected,
                    ]}>
                    {method === "biometric" && <View style={styles.radioDot} />}
                  </View>
                </Pressable>
                <Divider />
              </>
            )}

            <Pressable
              style={styles.methodRow}
              onPress={() => handleSelectMethod("pin")}
              accessibilityLabel="Mã PIN 6 số"
              accessibilityRole="radio">
              <View style={styles.methodRowLeft}>
                <Ionicons name="keypad-outline" size={s(22)} color={colors.iconDefault} />
                <View>
                  <Text style={styles.methodLabel}>Mã PIN 6 số</Text>
                  <Text style={styles.methodSublabel}>Nhập mã số để mở khóa</Text>
                </View>
              </View>
              <View
                style={[
                  styles.radio,
                  method === "pin" && styles.radioSelected,
                ]}>
                {method === "pin" && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          </View>
        )}

        {/* Change PIN */}
        {enabled && method === "pin" && (
          <View style={styles.card}>
            <Pressable
              style={styles.menuRow}
              onPress={() =>
                router.push({
                  pathname: ROUTES.PRIVACY_PIN_SETUP as never,
                  params: { mode: "change" },
                })
              }
              accessibilityLabel="Đổi mã PIN"
              accessibilityRole="button">
              <View style={styles.menuRowLeft}>
                <Ionicons name="key-outline" size={s(20)} color={colors.iconDefault} />
                <Text style={styles.menuLabel}>Đổi mã PIN</Text>
              </View>
              <Ionicons name="chevron-forward" size={s(16)} color={colors.text.muted} />
            </Pressable>
          </View>
        )}
      </ScrollView>
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
    scrollContent: {
      paddingHorizontal: SPACING[20],
      paddingBottom: SPACING[48],
      gap: SPACING[16],
    },
    card: {
      backgroundColor: colors.background.card,
      borderRadius: RADIUS.lg,
      padding: SPACING[16],
      gap: SPACING[12],
    },
    sectionLabel: {
      fontSize: FONT_SIZE[12],
      fontWeight: "600",
      color: colors.text.muted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    methodRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: SPACING[4],
    },
    methodRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING[12],
    },
    methodLabel: {
      fontSize: FONT_SIZE[15],
      color: colors.text.primary,
    },
    methodSublabel: {
      fontSize: FONT_SIZE[12],
      lineHeight: LINE_HEIGHT.tight,
      color: colors.text.muted,
    },
    radio: {
      width: s(20),
      height: s(20),
      borderRadius: RADIUS.full,
      borderWidth: 2,
      borderColor: colors.border.default,
      alignItems: "center",
      justifyContent: "center",
    },
    radioSelected: {
      borderColor: colors.brand.primary,
    },
    radioDot: {
      width: s(10),
      height: s(10),
      borderRadius: RADIUS.full,
      backgroundColor: colors.brand.primary,
    },
    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: SPACING[4],
    },
    menuRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING[12],
    },
    menuLabel: {
      fontSize: FONT_SIZE[15],
      color: colors.text.primary,
    },
  });
}
