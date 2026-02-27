import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

const BARS: Array<{ label: string; ratio: number; colorKey: keyof ThemeColors["mood"] }> = [
	{ label: "HAPPY", ratio: 0.75, colorKey: "enjoyment" },
	{ label: "SAD", ratio: 0.3, colorKey: "sadness" },
	{ label: "ANGRY", ratio: 0.5, colorKey: "anger" },
	{ label: "SURPRISED", ratio: 0.9, colorKey: "surprise" },
	{ label: "CONFUSED", ratio: 0.45, colorKey: "fear" },
];

export function EmotionIllustration() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<View style={styles.container}>
			{/* Outer glow ring */}
			<View style={styles.glowOuter} />

			{/* Main panel */}
			<LinearGradient
				colors={[colors.background.elevated, colors.background.card]}
				style={styles.panel}
			>
				{/* Header */}
				<View style={styles.header}>
					<View style={styles.headerDot} />
					<View style={styles.headerDot} />
					<View style={styles.headerDot} />
					<Text style={styles.headerText}>EMOTION ANALYSIS</Text>
				</View>

				{/* Bar chart */}
				<View style={styles.chart}>
					{BARS.map((bar) => (
						<View key={bar.label} style={styles.barRow}>
							<Text style={styles.barLabel}>{bar.label}</Text>
							<View style={styles.barTrack}>
								<LinearGradient
									colors={[colors.brand.surface, colors.mood[bar.colorKey]]}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 0 }}
									style={[styles.barFill, { flex: bar.ratio }]}
								/>
								<View style={[styles.barEmpty, { flex: 1 - bar.ratio }]} />
							</View>
							<Text style={styles.barValue}>{Math.round(bar.ratio * 100)}</Text>
						</View>
					))}
				</View>
			</LinearGradient>
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		container: {
			width: 240,
			height: 220,
			alignItems: "center",
			justifyContent: "center",
		},
		glowOuter: {
			position: "absolute",
			width: 220,
			height: 180,
			borderRadius: 20,
			backgroundColor: colors.brand.surface,
			opacity: 0.5,
		},
		panel: {
			width: 210,
			borderRadius: 14,
			padding: 14,
			gap: 12,
		},
		header: {
			flexDirection: "row",
			alignItems: "center",
			gap: 6,
		},
		headerDot: {
			width: 8,
			height: 8,
			borderRadius: 4,
			backgroundColor: colors.brand.primary,
			opacity: 0.7,
		},
		headerText: {
			color: colors.text.secondary,
			fontSize: 10,
			fontWeight: "700",
			letterSpacing: 1,
			marginLeft: 4,
		},
		chart: {
			gap: 8,
		},
		barRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 6,
		},
		barLabel: {
			color: colors.text.muted,
			fontSize: 8,
			fontWeight: "600",
			width: 52,
			letterSpacing: 0.5,
		},
		barTrack: {
			flex: 1,
			height: 10,
			borderRadius: 5,
			flexDirection: "row",
			overflow: "hidden",
			backgroundColor: colors.background.primary,
		},
		barFill: {
			height: "100%",
			borderRadius: 5,
		},
		barEmpty: {
			height: "100%",
		},
		barValue: {
			color: colors.text.muted,
			fontSize: 8,
			fontWeight: "600",
			width: 20,
			textAlign: "right",
		},
	});
}
