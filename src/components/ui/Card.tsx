// Reusable Card container component
// TODO: Add shadow, elevation, border-radius variants

import { StyleSheet, View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
	children: React.ReactNode;
}

export function Card({ children, style, ...rest }: CardProps) {
	return (
		<View
			style={[styles.card, style]}
			{...rest}>
			{children}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 2,
	},
});
