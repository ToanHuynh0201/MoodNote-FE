import { StyleSheet, Text, View } from "react-native";

// TODO: Implement forgot password screen (FR-03)
// - Input email field
// - Call auth.service.ts forgotPassword()
// - On success: show "Check your email" message
// - OTP reset valid for 1 hour (handled by backend)

export default function ForgotPasswordScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Forgot Password</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", alignItems: "center" },
	title: { fontSize: 24, fontWeight: "bold" },
});
