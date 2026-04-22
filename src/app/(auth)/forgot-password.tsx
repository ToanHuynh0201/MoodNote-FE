// FR-03: Forgot password — multi-step: email → OTP → new password
import { ScreenWrapper } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { AUTH_RESEND_COOLDOWN_SECONDS, FORGOT_PASSWORD_TOTAL_STEPS, ROUTES } from "@/constants";
import { useAuth, useThemeColors } from "@/hooks";
import { useForm } from "@/hooks/useForm";
import { authService } from "@/services";
import { forgotPasswordSchema, newPasswordSchema, verifyOtpSchema } from "@/schemas";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import { ms, s } from "@/utils";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TextInput as RNTextInput } from "react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

type Step = 1 | 2 | 3;

export default function ForgotPasswordScreen() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { forgotPassword, verifyResetOtp, resetPassword } = useAuth();

	const [step, setStep] = useState<Step>(1);
	const [email, setEmail] = useState("");
	const [resendTimer, setResendTimer] = useState(0);
	const [isResending, setIsResending] = useState(false);
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

	const passwordRef = useRef<RNTextInput>(null);
	const confirmPasswordRef = useRef<RNTextInput>(null);

	// Resend countdown (step 2 only)
	useEffect(() => {
		if (resendTimer <= 0) return;
		const id = setInterval(() => {
			setResendTimer((t) => t - 1);
		}, 1000);
		return () => clearInterval(id);
	}, [resendTimer]);

	// ─── Step 1 form — email ──────────────────────────────────────────────────

	const emailForm = useForm({
		schema: forgotPasswordSchema,
		defaultValues: { email: "" },
		onSubmit: async (values) => {
			await forgotPassword({ email: values.email });
			setEmail(values.email);
			setResendTimer(AUTH_RESEND_COOLDOWN_SECONDS);
			setStep(2);
		},
	});

	// ─── Step 2 form — OTP ───────────────────────────────────────────────────

	const otpForm = useForm({
		schema: verifyOtpSchema,
		defaultValues: { otp: "" },
		onSubmit: async (values) => {
			await verifyResetOtp({ email, otp: values.otp });
			setStep(3);
		},
	});

	// ─── Step 3 form — new password ──────────────────────────────────────────

	const passwordForm = useForm({
		schema: newPasswordSchema,
		defaultValues: { password: "", confirmPassword: "" },
		onSubmit: async (values) => {
			await resetPassword({
				email,
				password: values.password,
				confirmPassword: values.confirmPassword,
			});
			router.replace(ROUTES.LOGIN);
		},
	});

	// ─── Handlers ────────────────────────────────────────────────────────────

	const handleBack = useCallback(() => {
		if (step === 1) {
			router.back();
		} else {
			setStep((s) => (s - 1) as Step);
		}
	}, [step]);

	const handleResend = useCallback(async () => {
		if (resendTimer > 0 || isResending) return;
		setIsResending(true);
		try {
			await authService.resendResetOtp({ email });
			setResendTimer(AUTH_RESEND_COOLDOWN_SECONDS);
		} finally {
			setIsResending(false);
		}
	}, [resendTimer, isResending, email]);

	const togglePasswordVisible = useCallback(() => setPasswordVisible((v) => !v), []);
	const toggleConfirmPasswordVisible = useCallback(() => setConfirmPasswordVisible((v) => !v), []);
	const focusConfirmPassword = useCallback(() => confirmPasswordRef.current?.focus(), []);

	// ─── Step headings ───────────────────────────────────────────────────────

	const stepTitle: Record<Step, string> = {
		1: "Quên mật khẩu",
		2: "Nhập mã xác nhận",
		3: "Đặt lại mật khẩu",
	};

	const stepSubtitle: Record<Step, string> = {
		1: "Nhập email của bạn để nhận mã xác nhận.",
		2: `Chúng tôi đã gửi mã 6 số đến\n${email}`,
		3: "Tạo mật khẩu mới cho tài khoản của bạn.",
	};

	// ─── Render ──────────────────────────────────────────────────────────────

	return (
		<ScreenWrapper keyboard>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}>
				{/* Header row */}
				<Animated.View entering={FadeInDown.duration(300)} style={styles.headerRow}>
					<Pressable
						onPress={handleBack}
						hitSlop={12}
						style={styles.backButton}
						accessibilityLabel="Quay lại"
						accessibilityRole="button">
						<Feather name="arrow-left" size={s(22)} color={colors.text.primary} />
					</Pressable>

					{/* Progress dots */}
					<View style={styles.progressDots}>
						{Array.from({ length: FORGOT_PASSWORD_TOTAL_STEPS }, (_, i) => (
							<View
								key={i}
								style={[styles.dot, i + 1 === step ? styles.dotActive : styles.dotInactive]}
							/>
						))}
					</View>
				</Animated.View>

				{/* Heading */}
				<Animated.View
					key={`heading-${step}`}
					entering={FadeInDown.duration(400).delay(80)}
					style={styles.heading}>
					<Text style={styles.title}>{stepTitle[step]}</Text>
					<Text style={styles.subtitle}>{stepSubtitle[step]}</Text>
				</Animated.View>

				{/* Step 1 — Email */}
				{step === 1 && (
					<Animated.View
						key="form-1"
						entering={FadeInDown.duration(400).delay(160)}
						style={styles.form}>
						<Input
							label="Email"
							placeholder="email@example.com"
							keyboardType="email-address"
							autoCapitalize="none"
							autoCorrect={false}
							returnKeyType="done"
							onSubmitEditing={emailForm.submitForm}
							leftIcon={<Feather name="mail" size={s(18)} color={colors.iconDefault} />}
							{...emailForm.getFieldProps("email")}
						/>
						{emailForm.serverError ? (
							<View style={styles.errorBanner}>
								<Feather
									name="alert-circle"
									size={s(14)}
									color={colors.status.error}
									style={styles.errorIcon}
								/>
								<Text style={styles.errorText}>{emailForm.serverError}</Text>
							</View>
						) : null}
					</Animated.View>
				)}

				{/* Step 2 — OTP */}
				{step === 2 && (
					<Animated.View
						key="form-2"
						entering={FadeInDown.duration(400).delay(160)}
						style={styles.form}>
						<Input
							label="Mã xác thực"
							placeholder="000000"
							keyboardType="number-pad"
							maxLength={6}
							autoCorrect={false}
							returnKeyType="done"
							onSubmitEditing={otpForm.submitForm}
							leftIcon={<Feather name="shield" size={s(18)} color={colors.iconDefault} />}
							{...otpForm.getFieldProps("otp")}
						/>
						{otpForm.serverError ? (
							<View style={styles.errorBanner}>
								<Feather
									name="alert-circle"
									size={s(14)}
									color={colors.status.error}
									style={styles.errorIcon}
								/>
								<Text style={styles.errorText}>{otpForm.serverError}</Text>
							</View>
						) : null}
					</Animated.View>
				)}

				{/* Step 3 — New password */}
				{step === 3 && (
					<Animated.View
						key="form-3"
						entering={FadeInDown.duration(400).delay(160)}
						style={styles.form}>
						<Input
							ref={passwordRef}
							label="Mật khẩu mới"
							placeholder="••••••••"
							secureTextEntry={!passwordVisible}
							autoCapitalize="none"
							autoCorrect={false}
							returnKeyType="next"
							onSubmitEditing={focusConfirmPassword}
							leftIcon={<Feather name="lock" size={s(18)} color={colors.iconDefault} />}
							rightIcon={
								<Pressable
									onPress={togglePasswordVisible}
									hitSlop={8}
									accessibilityLabel={passwordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
									accessibilityRole="button">
									<Feather
										name={passwordVisible ? "eye-off" : "eye"}
										size={s(18)}
										color={colors.iconDefault}
									/>
								</Pressable>
							}
							{...passwordForm.getFieldProps("password")}
						/>
						<Input
							ref={confirmPasswordRef}
							label="Nhập lại mật khẩu"
							placeholder="••••••••"
							secureTextEntry={!confirmPasswordVisible}
							autoCapitalize="none"
							autoCorrect={false}
							returnKeyType="done"
							onSubmitEditing={passwordForm.submitForm}
							leftIcon={<Feather name="lock" size={s(18)} color={colors.iconDefault} />}
							rightIcon={
								<Pressable
									onPress={toggleConfirmPasswordVisible}
									hitSlop={8}
									accessibilityLabel={
										confirmPasswordVisible ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"
									}
									accessibilityRole="button">
									<Feather
										name={confirmPasswordVisible ? "eye-off" : "eye"}
										size={s(18)}
										color={colors.iconDefault}
									/>
								</Pressable>
							}
							{...passwordForm.getFieldProps("confirmPassword")}
						/>
						{passwordForm.serverError ? (
							<View style={styles.errorBanner}>
								<Feather
									name="alert-circle"
									size={s(14)}
									color={colors.status.error}
									style={styles.errorIcon}
								/>
								<Text style={styles.errorText}>{passwordForm.serverError}</Text>
							</View>
						) : null}
					</Animated.View>
				)}

				{/* Submit button */}
				<Animated.View entering={FadeInUp.duration(400).delay(240)}>
					{step === 1 && (
						<Button
							title="Gửi mã xác nhận"
							variant="primary"
							size="lg"
							fullWidth
							loading={emailForm.isSubmitting}
							onPress={emailForm.submitForm}
							accessibilityLabel="Gửi mã xác nhận đến email"
						/>
					)}
					{step === 2 && (
						<Button
							title="Xác nhận"
							variant="primary"
							size="lg"
							fullWidth
							loading={otpForm.isSubmitting}
							onPress={otpForm.submitForm}
							accessibilityLabel="Xác nhận mã OTP"
						/>
					)}
					{step === 3 && (
						<Button
							title="Đặt lại mật khẩu"
							variant="primary"
							size="lg"
							fullWidth
							loading={passwordForm.isSubmitting}
							onPress={passwordForm.submitForm}
							accessibilityLabel="Đặt lại mật khẩu"
						/>
					)}
				</Animated.View>

				{/* Resend row (step 2 only) */}
				{step === 2 && (
					<Animated.View entering={FadeInDown.duration(400).delay(320)} style={styles.resendRow}>
						<Text style={styles.resendPrompt}>Chưa nhận được mã? </Text>
						<Pressable
							onPress={handleResend}
							disabled={resendTimer > 0 || isResending}
							hitSlop={8}
							accessibilityLabel={
								resendTimer > 0 ? `Gửi lại sau ${resendTimer} giây` : "Gửi lại mã xác nhận"
							}
							accessibilityRole="button">
							<Text
								style={[
									styles.resendLink,
									(resendTimer > 0 || isResending) && styles.resendDisabled,
								]}>
								{resendTimer > 0 ? `Gửi lại (${resendTimer}s)` : "Gửi lại"}
							</Text>
						</Pressable>
					</Animated.View>
				)}
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
			justifyContent: "space-between",
		},
		backButton: {
			padding: SPACING[4],
		},
		progressDots: {
			flexDirection: "row",
			gap: SPACING[6],
			paddingRight: SPACING[4],
		},
		dot: {
			width: s(8),
			height: s(8),
			borderRadius: RADIUS.full,
		},
		dotActive: {
			backgroundColor: colors.brand.primary,
			width: s(20),
		},
		dotInactive: {
			backgroundColor: colors.border.subtle,
		},
		heading: {
			gap: SPACING[6],
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
