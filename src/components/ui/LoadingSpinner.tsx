// Full-screen loading spinner
// TODO: Add overlay variant, custom message support

import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useThemeColors } from "@/hooks";

interface LoadingSpinnerProps {
	size?: "small" | "large";
	/** Defaults to the brand primary color from the active theme */
	color?: string;
}

export function LoadingSpinner({ size = "large", color }: LoadingSpinnerProps) {
	const colors = useThemeColors();
	const spinnerColor = color ?? colors.brand.primary;
	const styles = useMemo(
		() => createStyles(colors.background.primary),
		[colors.background.primary],
	);

	return (
		<View style={styles.container}>
			<ActivityIndicator size={size} color={spinnerColor} />
		</View>
	);
}

function createStyles(backgroundColor: string) {
	return StyleSheet.create({
		container: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			backgroundColor,
		},
	});
}
