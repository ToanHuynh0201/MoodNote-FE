import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import { s } from "@/utils";

interface SaveStatusBannerProps {
	status: "idle" | "unsaved" | "saving" | "saved" | "error";
	/** When provided, tapping the "unsaved" or "error" pill triggers an immediate save. */
	onSaveNow?: () => void;
}

export function SaveStatusBanner({ status, onSaveNow }: SaveStatusBannerProps) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	if (status === "unsaved") {
		return (
			<Animated.View key="unsaved" entering={FadeIn.duration(200)}>
				<Pressable
					onPress={onSaveNow}
					disabled={onSaveNow === undefined}
					hitSlop={8}
					accessibilityRole="button"
					accessibilityLabel="Lưu ngay"
					style={[styles.pill, styles.pillWarning]}>
					<Ionicons name="cloud-upload-outline" size={s(14)} color={colors.status.warning} />
					<Text style={[styles.text, styles.textWarning]}>Chưa lưu</Text>
				</Pressable>
			</Animated.View>
		);
	}

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
			<Animated.View key="error" entering={FadeIn.duration(200)}>
				<Pressable
					onPress={onSaveNow}
					disabled={onSaveNow === undefined}
					hitSlop={8}
					accessibilityRole="button"
					accessibilityLabel="Thử lưu lại"
					style={[styles.pill, styles.pillError]}>
					<Ionicons name="alert-circle" size={s(14)} color={colors.status.error} />
					<Text style={[styles.text, styles.textError]}>Lỗi lưu</Text>
				</Pressable>
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
		pillWarning: {
			backgroundColor: colors.status.warningBackground,
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
		textWarning: {
			color: colors.status.warning,
		},
		textSuccess: {
			color: colors.status.success,
		},
		textError: {
			color: colors.status.error,
		},
	});
}
