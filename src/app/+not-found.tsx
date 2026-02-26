import { Link, Stack } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ROUTES } from "@/constants";
import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";

export default function NotFoundScreen() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<>
			<Stack.Screen options={{ title: "Oops!" }} />
			<View style={styles.container}>
				<Text style={styles.title}>This screen doesn't exist.</Text>

				<Link href={ROUTES.HOME} style={styles.link}>
					<Text style={styles.linkText}>Go to home screen!</Text>
				</Link>
			</View>
		</>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		container: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
			padding: 20,
			backgroundColor: colors.background.primary,
		},
		title: {
			fontSize: 20,
			fontWeight: "bold",
			color: colors.text.primary,
		},
		link: {
			marginTop: 15,
			paddingVertical: 15,
		},
		linkText: {
			fontSize: 14,
			color: colors.text.link,
		},
	});
}
