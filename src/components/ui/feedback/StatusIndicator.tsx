import { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { STATUS_INDICATOR_LABELS } from "@/constants";
import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, SPACING } from "@/theme";
import type { StatusIndicatorProps, StatusIndicatorStatus } from "@/types";
import { s } from "@/utils";

export function StatusIndicator({ status, showLabel = true }: StatusIndicatorProps) {
	const colors = useThemeColors();
	const pulseAnim = useRef(new Animated.Value(1)).current;
	const styles = useMemo(() => createStyles(colors), [colors]);

	function getDotColor(status: StatusIndicatorStatus, colors: ThemeColors): string {
		switch (status) {
			case "saving":
				return colors.status.warning;
			case "saved":
			case "online":
				return colors.status.success;
			case "error":
				return colors.status.error;
			case "offline":
				return colors.text.muted;
		}
	}
	const dotColor = getDotColor(status, colors);

	// Pulse animation while "saving"
	useEffect(() => {
		if (status === "saving") {
			const animation = Animated.loop(
				Animated.sequence([
					Animated.timing(pulseAnim, {
						toValue: 0.3,
						duration: 600,
						useNativeDriver: true,
					}),
					Animated.timing(pulseAnim, {
						toValue: 1,
						duration: 600,
						useNativeDriver: true,
					}),
				]),
			);
			animation.start();
			return () => animation.stop();
		} else {
			pulseAnim.setValue(1);
			return undefined;
		}
	}, [status, pulseAnim]);

	return (
		<View style={styles.row}>
			<Animated.View style={[styles.dot, { backgroundColor: dotColor, opacity: pulseAnim }]} />
			{showLabel && <Text style={styles.label}>{STATUS_INDICATOR_LABELS[status]}</Text>}
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		row: { flexDirection: "row", alignItems: "center" },
		dot: {
			width: s(8),
			height: s(8),
			borderRadius: s(4),
		},
		label: {
			fontSize: FONT_SIZE[12],
			color: colors.text.muted,
			marginLeft: SPACING[6],
		},
	});
}
