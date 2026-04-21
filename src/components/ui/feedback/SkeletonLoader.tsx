import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";

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
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { width: screenWidth } = useWindowDimensions();

	const shimmer = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const animation = Animated.loop(
			Animated.timing(shimmer, {
				toValue: 1,
				duration: 1400,
				useNativeDriver: true,
			}),
		);
		animation.start();
		return () => animation.stop();
	}, [shimmer]);

	const translateX = shimmer.interpolate({
		inputRange: [0, 1],
		outputRange: [-screenWidth, screenWidth],
	});

	return (
		<View style={[styles.skeleton, { width, height, borderRadius }, style]}>
			<Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
				<LinearGradient
					colors={[colors.background.skeleton, colors.background.skeletonHighlight, colors.background.skeleton]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					style={StyleSheet.absoluteFill}
				/>
			</Animated.View>
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		skeleton: {
			backgroundColor: colors.background.skeleton,
			overflow: "hidden",
		},
	});
}
