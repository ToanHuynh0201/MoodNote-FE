// Reusable Input component
// TODO: Implement with: label, error message, secure text (password), multiline support,
// left/right icon slots, focus ring

import {
	StyleSheet,
	Text,
	TextInput,
	TextInputProps,
	View,
} from "react-native";

interface InputProps extends TextInputProps {
	label?: string;
	error?: string;
}

export function Input({ label, error, style, ...rest }: InputProps) {
	return (
		<View style={styles.wrapper}>
			{label && <Text style={styles.label}>{label}</Text>}
			<TextInput
				style={[styles.input, error && styles.inputError, style]}
				placeholderTextColor="#9ca3af"
				{...rest}
			/>
			{error && <Text style={styles.error}>{error}</Text>}
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: { marginBottom: 16 },
	label: {
		fontSize: 14,
		fontWeight: "500",
		marginBottom: 4,
		color: "#374151",
	},
	input: {
		borderWidth: 1,
		borderColor: "#e5e7eb",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 16,
		color: "#1a1a1a",
		backgroundColor: "#fff",
	},
	inputError: { borderColor: "#ef4444" },
	error: { fontSize: 12, color: "#ef4444", marginTop: 4 },
});
