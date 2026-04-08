// NFR-04: Offline/syncing status banner
// NFR-18: Failed-sync warning with tap-to-retry

import { useSync, useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, SPACING } from "@/theme";
import { BANNER_HEIGHT } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

export function NetworkBanner() {
	const { isOnline, isSyncing, failedCount, retryFailed } = useSync();
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const showFailed = isOnline && !isSyncing && failedCount > 0;
	const visible = !isOnline || isSyncing || showFailed;
	const translateY = useSharedValue(visible ? 0 : -BANNER_HEIGHT);

	useEffect(() => {
		translateY.value = withTiming(visible ? 0 : -BANNER_HEIGHT, {
			duration: 250,
		});
	}, [visible, translateY]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	// Determine banner appearance based on priority: offline > syncing > failed
	let bgColor: string;
	let textColor: string;
	let iconName: "cloud-offline-outline" | "sync-outline" | "alert-circle-outline";
	let label: string;

	if (!isOnline) {
		bgColor = colors.status.warningBackground;
		textColor = colors.status.warning;
		iconName = "cloud-offline-outline";
		label = "Bạn đang offline. Nhật ký sẽ đồng bộ khi có kết nối.";
	} else if (isSyncing) {
		bgColor = colors.status.infoBackground;
		textColor = colors.status.info;
		iconName = "sync-outline";
		label = "Đang đồng bộ dữ liệu...";
	} else {
		// showFailed
		bgColor = colors.status.errorBackground;
		textColor = colors.status.error;
		iconName = "alert-circle-outline";
		label = `${failedCount} nhật ký không thể đồng bộ. Nhấn để thử lại.`;
	}

	if (!visible) return null;

	return (
		<Animated.View style={[styles.container, { backgroundColor: bgColor }, animatedStyle]}>
			<Pressable
				style={styles.pressable}
				onPress={showFailed ? retryFailed : undefined}
				accessibilityRole="button"
				accessibilityLabel={label}
				disabled={!showFailed}
			>
				<Ionicons name={iconName} size={14} color={textColor} />
				<Text style={[styles.text, { color: textColor }]} numberOfLines={1}>
					{label}
				</Text>
			</Pressable>
		</Animated.View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		container: {
			position: "absolute",
			top: 0,
			left: 0,
			right: 0,
			height: BANNER_HEIGHT,
			zIndex: 999,
		},
		pressable: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			gap: SPACING[6],
			paddingHorizontal: SPACING[16],
		},
		text: {
			fontSize: FONT_SIZE[12],
			lineHeight: LINE_HEIGHT.tight,
		},
	});
}
