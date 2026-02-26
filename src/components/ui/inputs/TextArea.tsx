import { useCallback, useMemo, useState } from "react";
import type { TextInputProps } from "react-native";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import type { TextAreaProps } from "@/types";

export function TextArea({
	label,
	error,
	hint,
	maxLength,
	showCharCount,
	minHeight = 120,
	style,
	onFocus,
	onBlur,
	onChangeText,
	value,
	...rest
}: TextAreaProps) {
	const colors = useThemeColors();
	const [focused, setFocused] = useState(false);
	const [charCount, setCharCount] = useState(typeof value === "string" ? value.length : 0);
	const styles = useMemo(() => createStyles(colors, minHeight), [colors, minHeight]);

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

	const handleChangeText = useCallback(
		(text: string) => {
			setCharCount(text.length);
			onChangeText?.(text);
		},
		[onChangeText],
	);

	const isNearLimit = maxLength != null && charCount > maxLength * 0.8;

	const borderStyle = error
		? styles.borderError
		: focused
			? styles.borderFocused
			: styles.borderDefault;

	return (
		<View style={styles.wrapper}>
			{label != null && <Text style={styles.label}>{label}</Text>}
			<TextInput
				style={[styles.input, borderStyle, style]}
				placeholderTextColor={colors.input.placeholder}
				multiline
				textAlignVertical="top"
				maxLength={maxLength}
				value={value}
				onFocus={handleFocus}
				onBlur={handleBlur}
				onChangeText={handleChangeText}
				{...rest}
			/>
			<View style={styles.footer}>
				<View style={styles.footerLeft}>
					{error != null && <Text style={styles.error}>{error}</Text>}
					{error == null && hint != null && <Text style={styles.hint}>{hint}</Text>}
				</View>
				{showCharCount === true && maxLength != null && (
					<Text style={[styles.charCount, isNearLimit && styles.charCountWarn]}>
						{charCount} / {maxLength}
					</Text>
				)}
			</View>
		</View>
	);
}

function createStyles(colors: ThemeColors, minHeight: number) {
	return StyleSheet.create({
		wrapper: { marginBottom: 16 },
		label: {
			fontSize: 14,
			fontWeight: "500",
			marginBottom: 6,
			color: colors.input.label,
		},
		input: {
			borderWidth: 1,
			borderRadius: 8,
			paddingHorizontal: 12,
			paddingVertical: 10,
			fontSize: 15,
			color: colors.input.text,
			backgroundColor: colors.input.background,
			minHeight,
		},
		borderDefault: { borderColor: colors.input.border },
		borderFocused: { borderColor: colors.input.borderFocused },
		borderError: { borderColor: colors.input.borderError },
		footer: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "flex-start",
			marginTop: 4,
		},
		footerLeft: { flex: 1 },
		error: { fontSize: 12, color: colors.status.error },
		hint: { fontSize: 12, color: colors.text.muted },
		charCount: { fontSize: 12, color: colors.text.muted, marginLeft: 8 },
		charCountWarn: { color: colors.status.warning },
	});
}
