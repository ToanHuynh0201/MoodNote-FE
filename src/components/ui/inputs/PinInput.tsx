import { useThemeColors } from "@/hooks";
import { APP_LOCK_CONFIG } from "@/constants/privacy";
import { RADIUS, SPACING } from "@/theme";
import type { ThemeColors } from "@/theme";
import type { PinInputProps } from "@/types";
import { s } from "@/utils";
import { useEffect, useMemo, useRef } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

export function PinInput({
  value,
  onChange,
  length = APP_LOCK_CONFIG.PIN_LENGTH,
  error = false,
  autoFocus = false,
  secureEntry = true,
}: PinInputProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      const timeout = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timeout);
    }
  }, [autoFocus]);

  const boxes = Array.from({ length }, (_, i) => {
    const filled = i < value.length;
    const active = i === value.length;
    return { filled, active };
  });

  return (
    <Pressable
      style={styles.container}
      onPress={() => inputRef.current?.focus()}
      accessibilityLabel="PIN input"
      accessibilityRole="none">
      {boxes.map(({ filled, active }, i) => (
        <View
          key={i}
          style={[
            styles.box,
            active && styles.boxActive,
            error && styles.boxError,
            filled && styles.boxFilled,
          ]}>
          {filled && (
            <View
              style={secureEntry ? styles.dot : undefined}>
              {!secureEntry && (
                <View style={styles.digitContainer}>
                  <TextInput
                    style={styles.digitText}
                    value={value[i]}
                    editable={false}
                    pointerEvents="none"
                    caretHidden
                  />
                </View>
              )}
            </View>
          )}
        </View>
      ))}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.hiddenInput}
        caretHidden
        contextMenuHidden
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: SPACING[10],
      alignItems: "center",
      justifyContent: "center",
    },
    box: {
      width: s(48),
      height: s(56),
      borderRadius: RADIUS.md,
      borderWidth: 1.5,
      borderColor: colors.border.default,
      backgroundColor: colors.input.background,
      alignItems: "center",
      justifyContent: "center",
    },
    boxActive: {
      borderColor: colors.brand.primary,
    },
    boxFilled: {
      borderColor: colors.border.strong,
    },
    boxError: {
      borderColor: colors.status.error,
    },
    dot: {
      width: s(10),
      height: s(10),
      borderRadius: RADIUS.full,
      backgroundColor: colors.text.primary,
    },
    digitContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    digitText: {
      color: colors.text.primary,
      fontSize: s(20),
      fontWeight: "600",
    },
    hiddenInput: {
      position: "absolute",
      width: 1,
      height: 1,
      opacity: 0,
    },
  });
}
