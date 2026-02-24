// Reusable Button component
// TODO: Implement with proper variants (primary, secondary, outline, ghost),
// loading state, disabled state, icon support

import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
} from "react-native";

interface ButtonProps {
	title: string;
	onPress: () => void;
	variant?: "primary" | "secondary" | "outline" | "ghost";
	loading?: boolean;
	disabled?: boolean;
}

export function Button({
	title,
	onPress,
	variant = "primary",
	loading,
	disabled,
}: ButtonProps) {
	return (
		<TouchableOpacity
			style={[
				styles.base,
				styles[variant],
				(disabled || loading) && styles.disabled,
			]}
			onPress={onPress}
			disabled={disabled || loading}>
			{loading ? (
				<ActivityIndicator color="#fff" />
			) : (
				<Text style={styles.text}>{title}</Text>
			)}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	base: {
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 24,
		alignItems: "center",
	},
	primary: { backgroundColor: "#6C63FF" },
	secondary: { backgroundColor: "#A89BFF" },
	outline: {
		backgroundColor: "transparent",
		borderWidth: 1,
		borderColor: "#6C63FF",
	},
	ghost: { backgroundColor: "transparent" },
	disabled: { opacity: 0.5 },
	text: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
