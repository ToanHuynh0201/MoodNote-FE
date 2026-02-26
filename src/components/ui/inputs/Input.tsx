import { useCallback, useMemo, useRef, useState } from "react";
import type { TextInput as RNTextInput, TextInputProps } from "react-native";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import type { InputProps } from "@/types";

export function Input({ label, error, hint, leftIcon, rightIcon, style, onFocus, onBlur, ...rest }: InputProps) {
	const colors = useThemeColors();
	const [focused, setFocused] = useState(false);
	const styles = useMemo(() => createStyles(colors), [colors]);
	const inputRef = useRef<RNTextInput>(null);

	const handleFocus = useCallback(
		(e: Parameters<NonNullable<TextInputProps["onFocus"]>>[0]) => {
			setFocused(true);
			onFocus?.(e);
		},
		[onFocus],
	);

	const handleBlur = useCallback(
		(e: Parameters<NonNullable<TextInputProps["onBlur"]>>[0]) => {
			setFocused(false);
			onBlur?.(e);
		},
		[onBlur],
	);

	const borderStyle = error
		? styles.inputBorderError
		: focused
			? styles.inputBorderFocused
			: styles.inputBorderDefault;

	const hasIcons = leftIcon != null || rightIcon != null;

	return (
		<View style={styles.wrapper}>
			{label != null && <Text style={styles.label}>{label}</Text>}
			<View style={[styles.inputRow, borderStyle, error != null && styles.inputBorderError]}>
				{leftIcon != null && <View style={styles.iconLeft}>{leftIcon}</View>}
				<TextInput
					ref={inputRef}
					style={[styles.input, hasIcons && styles.inputWithIcon, style]}
					placeholderTextColor={colors.input.placeholder}
					onFocus={handleFocus}
					onBlur={handleBlur}
					{...rest}
				/>
				{rightIcon != null && <View style={styles.iconRight}>{rightIcon}</View>}
			</View>
			{error != null && <Text style={styles.error}>{error}</Text>}
			{error == null && hint != null && <Text style={styles.hint}>{hint}</Text>}
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		wrapper: { marginBottom: 16 },
		label: {
			fontSize: 14,
			fontWeight: "500",
			marginBottom: 6,
			color: colors.input.label,
		},
		inputRow: {
			flexDirection: "row",
			alignItems: "center",
			borderWidth: 1,
			borderRadius: 8,
			backgroundColor: colors.input.background,
		},
		inputBorderDefault: { borderColor: colors.input.border },
		inputBorderFocused: { borderColor: colors.input.borderFocused },
		inputBorderError: { borderColor: colors.input.borderError },
		input: {
			flex: 1,
			paddingHorizontal: 12,
			paddingVertical: 10,
			fontSize: 15,
			color: colors.input.text,
		},
		inputWithIcon: { paddingHorizontal: 8 },
		iconLeft: { paddingLeft: 12 },
		iconRight: { paddingRight: 12 },
		error: { fontSize: 12, color: colors.status.error, marginTop: 4 },
		hint: { fontSize: 12, color: colors.text.muted, marginTop: 4 },
	});
}
