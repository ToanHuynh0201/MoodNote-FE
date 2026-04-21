import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import { s } from "@/utils";

interface SaveStatusBannerProps {
	status: "idle" | "saving" | "saved" | "error";
}

export function SaveStatusBanner({ status }: SaveStatusBannerProps) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	if (status === "saving") {
		return (
			<Animated.View key="saving" entering={FadeIn.duration(200)} style={styles.pill}>
				<ActivityIndicator size="small" color={colors.text.muted} />
				<Text style={styles.text}>Đang lưu...</Text>
			</Animated.View>
		);
	}

	if (status === "saved") {
		return (
			<Animated.View
				key="saved"
				entering={FadeIn.duration(200)}
				style={[styles.pill, styles.pillSuccess]}>
				<Ionicons name="checkmark-circle" size={s(14)} color={colors.status.success} />
				<Text style={[styles.text, styles.textSuccess]}>Đã lưu</Text>
			</Animated.View>
		);
	}

	if (status === "error") {
		return (
			<Animated.View
				key="error"
				entering={FadeIn.duration(200)}
				style={[styles.pill, styles.pillError]}>
				<Ionicons name="alert-circle" size={s(14)} color={colors.status.error} />
				<Text style={[styles.text, styles.textError]}>Lỗi lưu</Text>
			</Animated.View>
		);
	}

	return null;
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		pill: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(4),
			paddingHorizontal: SPACING[10],
			paddingVertical: SPACING[4],
			borderRadius: RADIUS.full,
			backgroundColor: colors.background.elevated,
		},
		pillSuccess: {
			backgroundColor: colors.status.successBackground,
		},
		pillError: {
			backgroundColor: colors.status.errorBackground,
		},
		text: {
			fontSize: FONT_SIZE[12],
			lineHeight: LINE_HEIGHT.tight,
			color: colors.text.muted,
		},
		textSuccess: {
			color: colors.status.success,
		},
		textError: {
			color: colors.status.error,
		},
	});
}
