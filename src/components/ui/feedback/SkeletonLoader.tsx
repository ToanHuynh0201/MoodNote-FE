import { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import type { SkeletonLoaderProps } from "@/types";

export function SkeletonLoader({
	width = "100%",
	height = 20,
	borderRadius = 4,
	style,
}: SkeletonLoaderProps) {
	const colors = useThemeColors();
	const shimmer = useRef(new Animated.Value(0)).current;
	const styles = useMemo(() => createStyles(colors), [colors]);

	useEffect(() => {
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(shimmer, {
					toValue: 1,
					duration: 750,
					useNativeDriver: true,
				}),
				Animated.timing(shimmer, {
					toValue: 0,
					duration: 750,
					useNativeDriver: true,
				}),
			]),
		);
		animation.start();
		return () => animation.stop();
	}, [shimmer]);

	const opacity = shimmer.interpolate({
		inputRange: [0, 1],
		outputRange: [0.4, 0.9],
	});

	return (
		<Animated.View
			style={[
				styles.skeleton,
				{ width, height, borderRadius, opacity },
				style,
			]}
		/>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		skeleton: { backgroundColor: colors.background.elevated },
	});
}
