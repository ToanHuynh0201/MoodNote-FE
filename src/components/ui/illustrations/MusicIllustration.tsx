import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

export function MusicIllustration() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<View style={styles.container}>
			{/* Outer glow ring */}
			<View style={styles.glowOuter} />
			<View style={styles.glowInner} />

			{/* Music notes — floating */}
			<View style={styles.noteTopLeft}>
				<MaterialCommunityIcons name="music-note" size={20} color={colors.brand.secondary} />
			</View>
			<View style={styles.noteTopRight}>
				<MaterialCommunityIcons name="music-note-eighth" size={16} color={colors.brand.primary} />
			</View>
			<View style={styles.noteBottomRight}>
				<MaterialCommunityIcons name="music-note" size={14} color={colors.brand.secondary} />
			</View>

			{/* Central headphones */}
			<LinearGradient
				colors={[colors.brand.secondary, colors.brand.primary]}
				style={styles.iconBackground}
			>
				<MaterialCommunityIcons
					name="headphones"
					size={72}
					color={colors.text.primary}
				/>
			</LinearGradient>

			{/* Bottom glow bar */}
			<LinearGradient
				colors={[colors.brand.secondary, colors.brand.primary]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 0 }}
				style={styles.glowBar}
			/>
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
			width: 190,
			height: 190,
			borderRadius: 95,
			backgroundColor: colors.brand.surface,
			opacity: 0.5,
		},
		glowInner: {
			position: "absolute",
			width: 130,
			height: 130,
			borderRadius: 65,
			backgroundColor: colors.brand.surface,
			opacity: 0.4,
		},
		noteTopLeft: {
			position: "absolute",
			top: 20,
			left: 18,
			opacity: 0.85,
		},
		noteTopRight: {
			position: "absolute",
			top: 30,
			right: 22,
			opacity: 0.7,
		},
		noteBottomRight: {
			position: "absolute",
			bottom: 50,
			right: 16,
			opacity: 0.6,
		},
		iconBackground: {
			width: 120,
			height: 120,
			borderRadius: 60,
			alignItems: "center",
			justifyContent: "center",
		},
		glowBar: {
			position: "absolute",
			bottom: 18,
			width: 100,
			height: 6,
			borderRadius: 3,
			opacity: 0.6,
		},
	});
}
