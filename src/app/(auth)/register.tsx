import { StyleSheet, Text, View } from "react-native";

// TODO: Implement register screen (FR-01)
// - Fields: email, password, confirmPassword
// - Validation: email format, password 8+ chars (uppercase, lowercase, number, special char)
// - Call auth.service.ts register()
// - On success: navigate to /(auth)/login (ask user to verify email)

export default function RegisterScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Register</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", alignItems: "center" },
	title: { fontSize: 24, fontWeight: "bold" },
});
