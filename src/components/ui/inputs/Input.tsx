import { useCallback, useMemo, useState } from "react";
import type { TextInputProps } from "react-native";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, RADIUS, SPACING } from "@/theme";
import type { InputProps } from "@/types";

export function Input({
	label,
	error,
	hint,
	leftIcon,
	rightIcon,
	style,
	onFocus,
	onBlur,
	ref,
	...rest
}: InputProps) {
	const colors = useThemeColors();
	const [focused, setFocused] = useState(false);
	const styles = useMemo(() => createStyles(colors), [colors]);

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
					ref={ref}
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
		wrapper: { marginBottom: SPACING[16] },
		label: {
			fontSize: FONT_SIZE[14],
			fontWeight: "500",
			marginBottom: SPACING[6],
			color: colors.input.label,
		},
		inputRow: {
			flexDirection: "row",
			alignItems: "center",
			borderWidth: 1,
			borderRadius: RADIUS.sm,
			backgroundColor: colors.input.background,
		},
		inputBorderDefault: { borderColor: colors.input.border },
		inputBorderFocused: { borderColor: colors.input.borderFocused },
		inputBorderError: { borderColor: colors.input.borderError },
		input: {
			flex: 1,
			paddingHorizontal: SPACING[12],
			paddingVertical: SPACING[10],
			fontSize: FONT_SIZE[15],
			color: colors.input.text,
		},
		inputWithIcon: { paddingHorizontal: SPACING[8] },
		iconLeft: { paddingLeft: SPACING[12] },
		iconRight: { paddingRight: SPACING[12] },
		error: { fontSize: FONT_SIZE[12], color: colors.status.error, marginTop: SPACING[4] },
		hint: { fontSize: FONT_SIZE[12], color: colors.text.muted, marginTop: SPACING[4] },
	});
}
