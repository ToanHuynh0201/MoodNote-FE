// Reusable Input component
// TODO: Implement with: label, error message, secure text (password), multiline support,
// left/right icon slots, focus ring

import { useMemo } from "react";
import type { TextInputProps } from "react-native";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";

interface InputProps extends TextInputProps {
	label?: string;
	error?: string;
}

export function Input({ label, error, style, ...rest }: InputProps) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<View style={styles.wrapper}>
			{label && <Text style={styles.label}>{label}</Text>}
			<TextInput
				style={[styles.input, error && styles.inputError, style]}
				placeholderTextColor={colors.input.placeholder}
				{...rest}
			/>
			{error && <Text style={styles.error}>{error}</Text>}
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		wrapper: { marginBottom: 16 },
		label: {
			fontSize: 14,
			fontWeight: "500",
			marginBottom: 4,
			color: colors.input.label,
		},
		input: {
			borderWidth: 1,
			borderColor: colors.input.border,
			borderRadius: 8,
			paddingHorizontal: 12,
			paddingVertical: 10,
			fontSize: 16,
			color: colors.input.text,
			backgroundColor: colors.input.background,
		},
		inputError: { borderColor: colors.input.borderError },
		error: { fontSize: 12, color: colors.status.error, marginTop: 4 },
	});
}
