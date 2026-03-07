import { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Placeholder home screen — shown after successful login
// TODO: Replace with full app once other features are implemented

import { useAuth, useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";

export default function HomeScreen() {
	const colors = useThemeColors();
	const { logout } = useAuth();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const handleLogout = useCallback(async () => {
		await logout();
	}, [logout]);

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.title}>MoodNote</Text>
			<Pressable
				style={styles.btn}
				onPress={handleLogout}
				accessibilityLabel="Đăng xuất"
				accessibilityRole="button">
				<Text style={styles.btnText}>Đăng xuất</Text>
			</Pressable>
		</SafeAreaView>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		container: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			gap: 16,
			backgroundColor: colors.background.primary,
		},
		title: { fontSize: 28, fontWeight: "bold", color: colors.brand.primary },
		btn: {
			marginTop: 24,
			backgroundColor: colors.status.error,
			borderRadius: 8,
			paddingVertical: 10,
			paddingHorizontal: 24,
		},
		btnText: { color: colors.text.inverse, fontWeight: "600" },
	});
}
