import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

export function JournalIllustration() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<View style={styles.container}>
			{/* Outer glow ring */}
			<View style={styles.glowOuter} />
			<View style={styles.glowInner} />

			{/* Main book card */}
			<LinearGradient
				colors={[colors.background.elevated, colors.background.card]}
				style={styles.card}
			>
				{/* Journal lines */}
				<View style={styles.linesContainer}>
					<View style={[styles.line, { width: "80%" }]} />
					<View style={[styles.line, { width: "65%" }]} />
					<View style={[styles.line, { width: "75%" }]} />
					<View style={[styles.line, { width: "50%" }]} />
				</View>

				{/* Book icon centered */}
				<View style={styles.iconWrapper}>
					<LinearGradient
						colors={[colors.brand.secondary, colors.brand.primary]}
						style={styles.iconBackground}
					>
						<MaterialCommunityIcons
							name="book-open-variant"
							size={52}
							color={colors.text.primary}
						/>
					</LinearGradient>
				</View>

				{/* Journal lines below icon */}
				<View style={styles.linesContainer}>
					<View style={[styles.line, { width: "70%" }]} />
					<View style={[styles.line, { width: "85%" }]} />
					<View style={[styles.line, { width: "55%" }]} />
				</View>
			</LinearGradient>
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		container: {
			width: 220,
			height: 220,
			alignItems: "center",
			justifyContent: "center",
		},
		glowOuter: {
			position: "absolute",
			width: 200,
			height: 200,
			borderRadius: 100,
			backgroundColor: colors.brand.surface,
			opacity: 0.4,
		},
		glowInner: {
			position: "absolute",
			width: 140,
			height: 140,
			borderRadius: 70,
			backgroundColor: colors.brand.surface,
			opacity: 0.5,
		},
		card: {
			width: 170,
			height: 200,
			borderRadius: 16,
			alignItems: "center",
			justifyContent: "space-between",
			paddingVertical: 20,
			paddingHorizontal: 16,
		},
		linesContainer: {
			width: "100%",
			gap: 8,
			alignItems: "flex-start",
		},
		line: {
			height: 4,
			backgroundColor: colors.border.default,
			borderRadius: 2,
			opacity: 0.7,
		},
		iconWrapper: {
			alignItems: "center",
			justifyContent: "center",
		},
		iconBackground: {
			width: 88,
			height: 88,
			borderRadius: 44,
			alignItems: "center",
			justifyContent: "center",
		},
	});
}
