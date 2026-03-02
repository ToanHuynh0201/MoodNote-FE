// FR-02: User login
import { ScreenWrapper } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useAuth, useThemeColors } from "@/hooks";
import { useForm } from "@/hooks/useForm";
import { loginSchema } from "@/schemas";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import { ms, s } from "@/utils";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import type { TextInput as RNTextInput } from "react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";

export default function LoginScreen() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { login } = useAuth();
	const [passwordVisible, setPasswordVisible] = useState(false);

	const emailRef = useRef<RNTextInput>(null);
	const passwordRef = useRef<RNTextInput>(null);

	const { getFieldProps, submitForm, isSubmitting, serverError } = useForm({
		schema: loginSchema,
		defaultValues: { email: "", password: "" },
		onSubmit: async (values) => {
			await login(values);
			router.replace(ROUTES.HOME);
		},
	});

	const togglePasswordVisible = useCallback(() => {
		setPasswordVisible((v) => !v);
	}, []);

	const handleForgotPassword = useCallback(() => {
		router.push(ROUTES.FORGOT_PASSWORD);
	}, []);

	const handleGoToRegister = useCallback(() => {
		router.push(ROUTES.REGISTER);
	}, []);

	const focusPassword = useCallback(() => {
		passwordRef.current?.focus();
	}, []);

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

				{/* Heading */}
				<Animated.View entering={FadeInDown.duration(400).delay(80)} style={styles.heading}>
					<Text style={styles.title}>Đăng nhập</Text>
					<Text style={styles.subtitle}>Chào mừng trở lại, hãy tiếp tục hành trình của bạn.</Text>
				</Animated.View>

				{/* Form */}
				<Animated.View entering={FadeInDown.duration(400).delay(160)} style={styles.form}>
					<Input
						ref={emailRef}
						label="Email"
						placeholder="email@example.com"
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
						returnKeyType="next"
						onSubmitEditing={focusPassword}
						leftIcon={<Feather name="mail" size={s(18)} color={colors.iconDefault} />}
						{...getFieldProps("email")}
					/>

					<Input
						ref={passwordRef}
						label="Mật khẩu"
						placeholder="••••••••"
						secureTextEntry={!passwordVisible}
						autoCapitalize="none"
						autoCorrect={false}
						returnKeyType="done"
						onSubmitEditing={submitForm}
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
						{...getFieldProps("password")}
					/>

					{/* Forgot password */}
					<Pressable
						style={styles.forgotWrapper}
						onPress={handleForgotPassword}
						hitSlop={8}
						accessibilityLabel="Quên mật khẩu"
						accessibilityRole="link">
						<Text style={styles.forgotText}>Quên mật khẩu?</Text>
					</Pressable>

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
						title="Đăng nhập"
						variant="primary"
						size="lg"
						fullWidth
						loading={isSubmitting}
						onPress={submitForm}
						accessibilityLabel="Đăng nhập vào tài khoản"
					/>
				</Animated.View>

				{/* Go to register */}
				<Animated.View entering={FadeIn.duration(400).delay(320)} style={styles.registerRow}>
					<Text style={styles.registerPrompt}>Chưa có tài khoản? </Text>
					<Pressable
						onPress={handleGoToRegister}
						hitSlop={8}
						accessibilityLabel="Tạo tài khoản mới"
						accessibilityRole="link">
						<Text style={styles.registerLink}>Đăng kí</Text>
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
		forgotWrapper: {
			alignSelf: "flex-end",
			marginTop: -SPACING[8],
		},
		forgotText: {
			color: colors.text.link,
			fontSize: FONT_SIZE[13],
			lineHeight: LINE_HEIGHT.normal,
			fontWeight: "500",
		},
		registerRow: {
			flexDirection: "row",
			justifyContent: "center",
			alignItems: "center",
		},
		registerPrompt: {
			color: colors.text.secondary,
			fontSize: FONT_SIZE[14],
			lineHeight: LINE_HEIGHT.normal,
		},
		registerLink: {
			color: colors.text.link,
			fontSize: FONT_SIZE[14],
			lineHeight: LINE_HEIGHT.normal,
			fontWeight: "600",
		},
	});
}
