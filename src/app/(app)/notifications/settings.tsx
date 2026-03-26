// Notification settings screen

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { Button } from "@/components/ui/buttons/Button";
import { Divider } from "@/components/ui/display/Divider";
import { SkeletonLoader } from "@/components/ui/feedback/SkeletonLoader";
import { ToggleSwitch } from "@/components/ui/inputs/ToggleSwitch";
import { Modal } from "@/components/ui/overlay/Modal";
import { useNotificationSettings, useThemeColors } from "@/hooks";
import { logError } from "@/utils/error";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import { s, vs } from "@/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MINUTE_STEP = 5;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NotificationSettingsScreen() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { settings, isLoading, isSaving, error, updateSettings } = useNotificationSettings();

	// Local state — mirrors server state, synced via useEffect
	const [reminderEnabled, setReminderEnabled] = useState(false);
	const [hourStr, setHourStr] = useState("08");
	const [minuteStr, setMinuteStr] = useState("00");
	const [reminderDays, setReminderDays] = useState<number[]>([1, 2, 3, 4, 5]);
	const [timePickerVisible, setTimePickerVisible] = useState(false);

	// Sync from server once loaded
	useEffect(() => {
		if (!settings) return;
		setReminderEnabled(settings.reminderEnabled);
		const [h = "08", m = "00"] = settings.reminderTime.split(":");
		setHourStr(h.padStart(2, "0"));
		setMinuteStr(m.padStart(2, "0"));
		setReminderDays(settings.reminderDays);
	}, [settings]);

	// ─── Handlers ──────────────────────────────────────────────────────────────

	const handleToggleReminder = useCallback(
		async (value: boolean) => {
			setReminderEnabled(value);
			try {
				await updateSettings({ reminderEnabled: value });
			} catch (err) {
				logError(err, { context: "NotificationSettings.toggleReminder" });
				setReminderEnabled(!value); // revert on failure
			}
		},
		[updateSettings],
	);

	const handleDayToggle = useCallback(
		async (day: number) => {
			const next = reminderDays.includes(day)
				? reminderDays.filter((d) => d !== day)
				: [...reminderDays, day].sort((a, b) => a - b);
			if (next.length === 0) return; // must keep at least 1 day
			setReminderDays(next);
			try {
				await updateSettings({ reminderDays: next });
			} catch (err) {
				logError(err, { context: "NotificationSettings.dayToggle" });
				setReminderDays(reminderDays); // revert
			}
		},
		[reminderDays, updateSettings],
	);

	const handleTimeConfirm = useCallback(async () => {
		const time = `${hourStr}:${minuteStr}`;
		setTimePickerVisible(false);
		try {
			await updateSettings({ reminderTime: time });
		} catch (err) {
			logError(err, { context: "NotificationSettings.timeConfirm" });
		}
	}, [hourStr, minuteStr, updateSettings]);

	// Hour/minute increment helpers
	const incrementHour = useCallback(() => {
		setHourStr((prev) => String((parseInt(prev, 10) + 1) % 24).padStart(2, "0"));
	}, []);
	const decrementHour = useCallback(() => {
		setHourStr((prev) => String((parseInt(prev, 10) + 23) % 24).padStart(2, "0"));
	}, []);
	const incrementMinute = useCallback(() => {
		const steps = 60 / MINUTE_STEP;
		setMinuteStr((prev) => {
			const idx = parseInt(prev, 10) / MINUTE_STEP;
			return String(((idx + 1) % steps) * MINUTE_STEP).padStart(2, "0");
		});
	}, []);
	const decrementMinute = useCallback(() => {
		const steps = 60 / MINUTE_STEP;
		setMinuteStr((prev) => {
			const idx = parseInt(prev, 10) / MINUTE_STEP;
			return String(((idx - 1 + steps) % steps) * MINUTE_STEP).padStart(2, "0");
		});
	}, []);

	// ─── Render ─────────────────────────────────────────────────────────────────

	return (
		<ScreenWrapper padded={false}>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled">
				{/* Header */}
				<View style={styles.header}>
					<Pressable
						onPress={() => router.back()}
						hitSlop={8}
						accessibilityLabel="Quay lại"
						accessibilityRole="button">
						<Ionicons name="chevron-back" size={s(26)} color={colors.text.primary} />
					</Pressable>
					<Text style={styles.headerTitle}>Cài đặt thông báo</Text>
					{isSaving ? (
						<ActivityIndicator size="small" color={colors.brand.primary} />
					) : (
						<View style={{ width: s(26) }} />
					)}
				</View>

				{/* Error banner */}
				{error != null && (
					<View style={styles.errorBanner}>
						<Text style={styles.errorText}>{error}</Text>
					</View>
				)}

				{isLoading ? (
					/* Skeleton */
					<View style={styles.skeletonGroup}>
						<SkeletonLoader width="100%" height={vs(60)} borderRadius={RADIUS.lg} />
						<SkeletonLoader width="100%" height={vs(60)} borderRadius={RADIUS.lg} />
					</View>
				) : (
					<>
						{/* Reminder toggle + time picker */}
						<View style={styles.card}>
							<ToggleSwitch
								label="Nhắc nhở hàng ngày"
								sublabel={
									reminderEnabled
										? `Nhắc lúc ${hourStr}:${minuteStr}`
										: "Tắt nhắc nhở"
								}
								value={reminderEnabled}
								onValueChange={(v) => void handleToggleReminder(v)}
							/>

							{reminderEnabled && (
								<>
									<Divider />
									<Pressable
										style={styles.timeRow}
										onPress={() => setTimePickerVisible(true)}
										accessibilityLabel={`Thời gian nhắc: ${hourStr}:${minuteStr}`}
										accessibilityRole="button">
										<Text style={styles.timeLabel}>Thời gian nhắc</Text>
										<View style={styles.timeRight}>
											<Text style={styles.timeValue}>
												{hourStr}:{minuteStr}
											</Text>
											<Ionicons
												name="chevron-forward"
												size={s(16)}
												color={colors.text.muted}
											/>
										</View>
									</Pressable>
								</>
							)}
						</View>

						{/* Day picker */}
						{reminderEnabled && (
							<View style={styles.card}>
								<Text style={styles.sectionLabel}>Ngày nhắc</Text>
								<View style={styles.daysRow}>
									{DAY_LABELS.map((label, i) => {
										const day = i + 1; // ISO weekday 1–7
										const selected = reminderDays.includes(day);
										return (
											<Pressable
												key={day}
												style={[
													styles.dayChip,
													selected
														? { backgroundColor: colors.brand.primary }
														: {
																backgroundColor:
																	colors.background.card,
																borderWidth: 1,
																borderColor: colors.border.default,
														  },
												]}
												onPress={() => void handleDayToggle(day)}
												accessibilityLabel={label}
												accessibilityRole="button">
												<Text
													style={[
														styles.dayChipText,
														{
															color: selected
																? colors.text.inverse
																: colors.text.secondary,
														},
													]}>
													{label}
												</Text>
											</Pressable>
										);
									})}
								</View>
							</View>
						)}
					</>
				)}
			</ScrollView>

			{/* Time picker modal */}
			<Modal
				visible={timePickerVisible}
				onDismiss={() => setTimePickerVisible(false)}
				title="Chọn giờ">
				<View style={styles.picker}>
					{/* Hour column */}
					<View style={styles.pickerCol}>
						<Pressable
							onPress={incrementHour}
							hitSlop={8}
							accessibilityLabel="Tăng giờ"
							accessibilityRole="button">
							<Ionicons name="chevron-up" size={s(28)} color={colors.text.secondary} />
						</Pressable>
						<Text style={styles.pickerValue}>{hourStr}</Text>
						<Pressable
							onPress={decrementHour}
							hitSlop={8}
							accessibilityLabel="Giảm giờ"
							accessibilityRole="button">
							<Ionicons
								name="chevron-down"
								size={s(28)}
								color={colors.text.secondary}
							/>
						</Pressable>
					</View>

					<Text style={styles.pickerColon}>:</Text>

					{/* Minute column */}
					<View style={styles.pickerCol}>
						<Pressable
							onPress={incrementMinute}
							hitSlop={8}
							accessibilityLabel="Tăng phút"
							accessibilityRole="button">
							<Ionicons name="chevron-up" size={s(28)} color={colors.text.secondary} />
						</Pressable>
						<Text style={styles.pickerValue}>{minuteStr}</Text>
						<Pressable
							onPress={decrementMinute}
							hitSlop={8}
							accessibilityLabel="Giảm phút"
							accessibilityRole="button">
							<Ionicons
								name="chevron-down"
								size={s(28)}
								color={colors.text.secondary}
							/>
						</Pressable>
					</View>
				</View>

				<Button
					title="Xong"
					variant="primary"
					fullWidth
					onPress={() => void handleTimeConfirm()}
				/>
			</Modal>
		</ScreenWrapper>
	);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		scrollContent: {
			paddingHorizontal: SPACING[20],
			paddingBottom: vs(40),
			gap: SPACING[16],
		},
		header: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingVertical: SPACING[12],
		},
		headerTitle: {
			fontSize: FONT_SIZE[17],
			fontWeight: "700",
			color: colors.text.primary,
			lineHeight: LINE_HEIGHT.relaxed,
		},
		errorBanner: {
			backgroundColor: colors.status.errorBackground,
			borderRadius: RADIUS.md,
			paddingHorizontal: SPACING[12],
			paddingVertical: SPACING[8],
		},
		errorText: {
			fontSize: FONT_SIZE[13],
			color: colors.status.error,
		},
		skeletonGroup: {
			gap: SPACING[12],
		},
		card: {
			backgroundColor: colors.background.card,
			borderRadius: RADIUS.lg,
			padding: SPACING[16],
			gap: SPACING[12],
		},
		timeRow: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
		},
		timeLabel: {
			fontSize: FONT_SIZE[15],
			color: colors.text.primary,
		},
		timeRight: {
			flexDirection: "row",
			alignItems: "center",
			gap: SPACING[4],
		},
		timeValue: {
			fontSize: FONT_SIZE[15],
			color: colors.brand.primary,
			fontWeight: "600",
		},
		sectionLabel: {
			fontSize: FONT_SIZE[13],
			color: colors.text.muted,
			fontWeight: "500",
		},
		daysRow: {
			flexDirection: "row",
			flexWrap: "wrap",
			gap: SPACING[8],
		},
		dayChip: {
			borderRadius: RADIUS.full,
			paddingHorizontal: SPACING[12],
			paddingVertical: s(7),
			minWidth: s(40),
			alignItems: "center",
		},
		dayChipText: {
			fontSize: FONT_SIZE[13],
			fontWeight: "600",
		},
		// Time picker modal content
		picker: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			gap: SPACING[24],
			paddingVertical: SPACING[24],
		},
		pickerCol: {
			alignItems: "center",
			gap: SPACING[16],
		},
		pickerValue: {
			fontSize: FONT_SIZE[22],
			fontWeight: "700",
			color: colors.text.primary,
			minWidth: s(48),
			textAlign: "center",
		},
		pickerColon: {
			fontSize: FONT_SIZE[22],
			fontWeight: "700",
			color: colors.text.primary,
			marginTop: vs(-8),
		},
	});
}
