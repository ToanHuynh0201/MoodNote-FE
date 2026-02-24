import { StyleSheet, Text, View } from "react-native";

// TODO: Implement login screen (FR-02)
// - Email + password form using react-hook-form + Zod
// - Call auth.service.ts login()
// - On success: store tokens → navigate to /(app)/(tabs)
// - Link to /register and /forgot-password

export default function LoginScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Login</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", alignItems: "center" },
	title: { fontSize: 24, fontWeight: "bold" },
});
