import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

import { POPUP_BOTTOM } from "@/constants";
import { usePlayer, useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import { s, vs } from "@/utils";
import { WaveformBars } from "./WaveformBars";

interface Props {
	visible: boolean;
}

export function MusicPlayerPanel({ visible }: Props) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const {
		currentTrack,
		isPlaying,
		isLoading,
		hasQueue,
		queue,
		currentIndex,
		positionMillis,
		durationMillis,
		next,
		previous,
		togglePlay,
	} = usePlayer();

	const opacity = useSharedValue(0);
	const translateY = useSharedValue(vs(8));

	useEffect(() => {
		if (visible) {
			opacity.value = withTiming(1, { duration: 180 });
			translateY.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
		} else {
			opacity.value = withTiming(0, { duration: 160 });
			translateY.value = withTiming(vs(8), { duration: 180, easing: Easing.in(Easing.cubic) });
		}
	}, [visible, opacity, translateY]);

	const animStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ translateY: translateY.value }],
	}));

	const handleToggle = () => {
		void togglePlay();
	};

	const handleNext = () => {
		void next();
	};

	const handlePrevious = () => {
		void previous();
	};

	const progress = durationMillis > 0 ? positionMillis / durationMillis : 0;

	return (
		<Animated.View
			style={[styles.container, animStyle]}
			pointerEvents={visible ? "box-none" : "none"}>
			<LinearGradient
				colors={[colors.brand.secondary, colors.brand.primaryPressed]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.card}>
				{hasQueue && currentTrack ? (
					<>
						<View style={styles.trackInfo}>
							<Text style={styles.trackName} numberOfLines={1}>
								{currentTrack.trackName}
							</Text>
							<View style={styles.artistRow}>
								<WaveformBars isPlaying={isPlaying} color={colors.text.inverse} />
								<Text style={styles.artistName} numberOfLines={1}>
									{currentTrack.artists?.join(" · ") ?? ""}
								</Text>
							</View>
							<Text style={styles.trackCounter}>
								{currentIndex + 1} / {queue.length}
							</Text>
						</View>

						<View style={styles.controls}>
							<Pressable
								onPress={handlePrevious}
								hitSlop={8}
								accessibilityRole="button"
								accessibilityLabel="Bài trước">
								<Ionicons name="play-skip-back" size={s(22)} color={colors.text.inverse} />
							</Pressable>

							<Pressable
								onPress={handleToggle}
								hitSlop={8}
								style={styles.playBtn}
								accessibilityRole="button"
								accessibilityLabel={isPlaying ? "Tạm dừng" : "Phát nhạc"}>
								{isLoading ? (
									<ActivityIndicator size="small" color={colors.brand.primary} />
								) : (
									<Ionicons
										name={isPlaying ? "pause" : "play"}
										size={s(22)}
										color={colors.brand.primary}
									/>
								)}
							</Pressable>

							<Pressable
								onPress={handleNext}
								hitSlop={8}
								accessibilityRole="button"
								accessibilityLabel="Bài tiếp theo">
								<Ionicons name="play-skip-forward" size={s(22)} color={colors.text.inverse} />
							</Pressable>
						</View>

						<View style={styles.progressOuter}>
							<View style={styles.progressBg} />
							<View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
						</View>
					</>
				) : (
					<View style={styles.emptyState}>
						<Ionicons name="musical-notes-outline" size={s(20)} color={colors.text.inverse} />
						<Text style={styles.emptyText}>Chưa có nhạc nào</Text>
					</View>
				)}
			</LinearGradient>
		</Animated.View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		container: {
			position: "absolute",
			bottom: POPUP_BOTTOM,
			left: 0,
			right: 0,
			alignItems: "center",
		},
		card: {
			borderRadius: RADIUS.xl,
			minWidth: s(240),
			overflow: "hidden",
			shadowColor: colors.shadow,
			shadowOffset: { width: 0, height: vs(4) },
			shadowOpacity: 0.25,
			shadowRadius: s(12),
			elevation: 16,
			paddingHorizontal: SPACING[20],
			paddingVertical: SPACING[16],
		},
		trackInfo: {
			alignItems: "center",
			gap: vs(4),
			marginBottom: SPACING[12],
		},
		trackName: {
			fontSize: FONT_SIZE[14],
			fontWeight: "700",
			color: colors.text.inverse,
			lineHeight: LINE_HEIGHT.normal,
			textAlign: "center",
		},
		artistRow: {
			flexDirection: "row",
			alignItems: "flex-end",
			gap: s(6),
		},
		artistName: {
			fontSize: FONT_SIZE[12],
			color: colors.text.inverse,
			lineHeight: LINE_HEIGHT.tight,
			opacity: 0.8,
		},
		trackCounter: {
			fontSize: FONT_SIZE[11],
			color: colors.text.inverse,
			lineHeight: LINE_HEIGHT.tight,
			opacity: 0.6,
		},
		controls: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			gap: s(28),
		},
		playBtn: {
			width: s(40),
			height: s(40),
			borderRadius: RADIUS.full,
			backgroundColor: colors.text.inverse,
			alignItems: "center",
			justifyContent: "center",
		},
		progressOuter: {
			marginTop: SPACING[12],
			height: vs(2),
			borderRadius: RADIUS.full,
			overflow: "hidden",
		},
		progressBg: {
			...StyleSheet.absoluteFillObject,
			backgroundColor: colors.text.inverse,
			opacity: 0.3,
		},
		progressFill: {
			height: "100%",
			backgroundColor: colors.text.inverse,
			borderRadius: RADIUS.full,
		},
		emptyState: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(8),
			paddingVertical: SPACING[4],
		},
		emptyText: {
			fontSize: FONT_SIZE[14],
			color: colors.text.inverse,
			lineHeight: LINE_HEIGHT.normal,
			opacity: 0.85,
		},
	});
}
