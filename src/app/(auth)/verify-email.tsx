// FR-01: Email verification after registration
import { ScreenWrapper } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useAuth, useThemeColors } from "@/hooks";
import { useForm } from "@/hooks/useForm";
import { verifyOtpSchema } from "@/schemas";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SIZE, SPACING } from "@/theme";
import { ms, s } from "@/utils";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";

const RESEND_COOLDOWN = 60;

export default function VerifyEmailScreen() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { verifyEmail, resendVerification } = useAuth();
	const { email } = useLocalSearchParams<{ email: string }>();

	const [timer, setTimer] = useState(RESEND_COOLDOWN);
	const [isResending, setIsResending] = useState(false);

	// Countdown timer — starts immediately on mount
	useEffect(() => {
		if (timer <= 0) return;
		const id = setInterval(() => {
			setTimer((t) => t - 1);
		}, 1000);
		return () => clearInterval(id);
	}, [timer]);

	const { getFieldProps, submitForm, isSubmitting, serverError } = useForm({
		schema: verifyOtpSchema,
		defaultValues: { otp: "" },
		onSubmit: async (values) => {
			await verifyEmail({ email: email ?? "", otp: values.otp });
			router.replace(ROUTES.LOGIN);
		},
	});

	const handleResend = useCallback(async () => {
		if (timer > 0 || isResending) return;
		setIsResending(true);
		try {
			await resendVerification({ email: email ?? "" });
			setTimer(RESEND_COOLDOWN);
		} finally {
			setIsResending(false);
		}
	}, [timer, isResending, resendVerification, email]);

	return (
		<ScreenWrapper keyboard>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}>
				{/* Header row with back button */}
				<Animated.View entering={FadeInDown.duration(300)} style={styles.headerRow}>
					<Pressable
						onPress={router.back}
						hitSlop={12}
						style={styles.backButton}
						accessibilityLabel="Quay lại"
						accessibilityRole="button">
						<Feather name="arrow-left" size={s(22)} color={colors.text.primary} />
					</Pressable>
				</Animated.View>

				{/* Icon + Heading */}
				<Animated.View entering={FadeInDown.duration(400).delay(80)} style={styles.heading}>
					<View style={styles.iconWrapper}>
						<Feather name="mail" size={s(32)} color={colors.brand.primary} />
					</View>
					<Text style={styles.title}>Xác thực email</Text>
					<Text style={styles.subtitle}>
						Chúng tôi đã gửi mã 6 số đến{"\n"}
						<Text style={styles.emailText}>{email}</Text>
					</Text>
				</Animated.View>

				{/* Form */}
				<Animated.View entering={FadeInDown.duration(400).delay(160)} style={styles.form}>
					<Input
						label="Mã xác thực"
						placeholder="000000"
						keyboardType="number-pad"
						maxLength={6}
						autoCorrect={false}
						returnKeyType="done"
						onSubmitEditing={submitForm}
						leftIcon={<Feather name="shield" size={s(18)} color={colors.iconDefault} />}
						{...getFieldProps("otp")}
					/>

					{/* Server error */}
					{serverError ? (
						<View style={styles.errorBanner}>
							<Feather
								name="alert-circle"
								size={s(14)}
								color={colors.status.error}
								style={styles.errorIcon}
							/>
							<Text style={styles.errorText}>{serverError}</Text>
						</View>
					) : null}
				</Animated.View>

				{/* Submit */}
				<Animated.View entering={FadeInUp.duration(400).delay(240)}>
					<Button
						title="Xác thực"
						variant="primary"
						size="lg"
						fullWidth
						loading={isSubmitting}
						onPress={submitForm}
						accessibilityLabel="Xác thực email"
					/>
				</Animated.View>

				{/* Resend row */}
				<Animated.View entering={FadeIn.duration(400).delay(320)} style={styles.resendRow}>
					<Text style={styles.resendPrompt}>Chưa nhận được mã? </Text>
					<Pressable
						onPress={handleResend}
						disabled={timer > 0 || isResending}
						hitSlop={8}
						accessibilityLabel={timer > 0 ? `Gửi lại sau ${timer} giây` : "Gửi lại mã xác thực"}
						accessibilityRole="button">
						<Text style={[styles.resendLink, (timer > 0 || isResending) && styles.resendDisabled]}>
							{timer > 0 ? `Gửi lại (${timer}s)` : "Gửi lại"}
						</Text>
					</Pressable>
				</Animated.View>
			</ScrollView>
		</ScreenWrapper>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		scroll: {
			flex: 1,
		},
		scrollContent: {
			flexGrow: 1,
			paddingTop: SPACING[32],
			paddingBottom: SPACING[32],
			gap: SPACING[24],
		},
		headerRow: {
			flexDirection: "row",
			alignItems: "center",
		},
		backButton: {
			padding: SPACING[4],
		},
		heading: {
			gap: SPACING[12],
		},
		iconWrapper: {
			width: SIZE.xl,
			height: SIZE.xl,
			borderRadius: RADIUS.lg,
			backgroundColor: colors.brand.surface,
			alignItems: "center",
			justifyContent: "center",
		},
		title: {
			color: colors.text.primary,
			fontSize: ms(28),
			fontWeight: "700",
			lineHeight: LINE_HEIGHT.loose,
		},
		subtitle: {
			color: colors.text.secondary,
			fontSize: FONT_SIZE[14],
			lineHeight: LINE_HEIGHT.relaxed,
		},
		emailText: {
			color: colors.text.primary,
			fontWeight: "600",
		},
		form: {
			gap: SPACING[4],
		},
		errorBanner: {
			flexDirection: "row",
			alignItems: "center",
			gap: SPACING[8],
			backgroundColor: colors.status.errorBackground,
			borderRadius: RADIUS.md,
			paddingHorizontal: SPACING[12],
			paddingVertical: SPACING[10],
		},
		errorIcon: {
			flexShrink: 0,
		},
		errorText: {
			flex: 1,
			color: colors.status.error,
			fontSize: FONT_SIZE[13],
			lineHeight: LINE_HEIGHT.normal,
		},
		resendRow: {
			flexDirection: "row",
			justifyContent: "center",
			alignItems: "center",
		},
		resendPrompt: {
			color: colors.text.secondary,
			fontSize: FONT_SIZE[14],
			lineHeight: LINE_HEIGHT.normal,
		},
		resendLink: {
			color: colors.text.link,
			fontSize: FONT_SIZE[14],
			lineHeight: LINE_HEIGHT.normal,
			fontWeight: "600",
		},
		resendDisabled: {
			color: colors.interactive.disabled,
		},
	});
}
