import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Placeholder home screen — shown after successful login
// TODO: Replace with full app once other features are implemented

export default function HomeScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>MoodNote</Text>
			<Text style={styles.subtitle}></Text>
			<TouchableOpacity style={styles.btn}>
				<Text style={styles.btnText}>Đăng xuất</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 16,
	},
	title: { fontSize: 28, fontWeight: "bold", color: "#6C63FF" },
	subtitle: { fontSize: 16, color: "#6b7280" },
	btn: {
		marginTop: 24,
		backgroundColor: "#ef4444",
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 24,
	},
	btnText: { color: "#fff", fontWeight: "600" },
});
