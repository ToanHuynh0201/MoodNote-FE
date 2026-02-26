import { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import type { ProgressBarProps } from "@/types";

export function ProgressBar({
	value,
	color,
	trackColor,
	height = 6,
	animated = true,
	showLabel,
}: ProgressBarProps) {
	const colors = useThemeColors();
	const fillColor = color ?? colors.brand.primary;
	const bgColor = trackColor ?? colors.background.secondary;
	const styles = useMemo(
		() => createStyles(bgColor, fillColor, height),
		[bgColor, fillColor, height],
	);

	const clamped = Math.min(100, Math.max(0, value));
	const widthAnim = useRef(new Animated.Value(clamped)).current;

	useEffect(() => {
		if (animated) {
			Animated.timing(widthAnim, {
				toValue: clamped,
				duration: 300,
				useNativeDriver: false,
			}).start();
		} else {
			widthAnim.setValue(clamped);
		}
	}, [clamped, animated, widthAnim]);

	const fillWidth = widthAnim.interpolate({
		inputRange: [0, 100],
		outputRange: ["0%", "100%"],
	});

	return (
		<View>
			<View style={styles.track}>
				<Animated.View style={[styles.fill, { width: fillWidth }]} />
			</View>
			{showLabel === true && (
				<Text style={styles.label}>{clamped}%</Text>
			)}
		</View>
	);
}

function createStyles(bgColor: string, fillColor: string, height: number) {
	return StyleSheet.create({
		track: {
			height,
			borderRadius: height / 2,
			backgroundColor: bgColor,
			overflow: "hidden",
		},
		fill: {
			height,
			borderRadius: height / 2,
			backgroundColor: fillColor,
		},
		label: {
			fontSize: 12,
			marginTop: 4,
			textAlign: "right",
		},
	});
}
