// Badge/chip component — used for emotion labels and tags (FR-08)
// TODO: Add size variants, close/dismiss button for tag chips

import { StyleSheet, Text, View } from "react-native";

interface BadgeProps {
	label: string;
	color?: string;
	textColor?: string;
}

export function Badge({
	label,
	color = "#EDE9FE",
	textColor = "#6C63FF",
}: BadgeProps) {
	return (
		<View style={[styles.badge, { backgroundColor: color }]}>
			<Text style={[styles.text, { color: textColor }]}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	badge: {
		borderRadius: 999,
		paddingVertical: 3,
		paddingHorizontal: 10,
		alignSelf: "flex-start",
	},
	text: { fontSize: 12, fontWeight: "500" },
});
