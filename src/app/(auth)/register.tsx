// FR-01: User registration
import { ScreenWrapper } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useAuth, useThemeColors } from "@/hooks";
import { useForm } from "@/hooks/useForm";
import { registerSchema } from "@/schemas";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import { ms, s } from "@/utils";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import type { TextInput as RNTextInput } from "react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";

export default function RegisterScreen() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { register } = useAuth();
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

	const nameRef = useRef<RNTextInput>(null);
	const usernameRef = useRef<RNTextInput>(null);
	const emailRef = useRef<RNTextInput>(null);
	const passwordRef = useRef<RNTextInput>(null);
	const confirmPasswordRef = useRef<RNTextInput>(null);

	const { getFieldProps, submitForm, isSubmitting, serverError } = useForm({
		schema: registerSchema,
		defaultValues: { name: "", username: "", email: "", password: "", confirmPassword: "" },
		onSubmit: async (values) => {
			await register(values);
			router.push({ pathname: ROUTES.VERIFY_EMAIL, params: { email: values.email } });
		},
	});

	const togglePasswordVisible = useCallback(() => {
		setPasswordVisible((v) => !v);
	}, []);

	const toggleConfirmPasswordVisible = useCallback(() => {
		setConfirmPasswordVisible((v) => !v);
	}, []);

	const handleGoToLogin = useCallback(() => {
		router.push(ROUTES.LOGIN);
	}, []);

	const focusUsername = useCallback(() => usernameRef.current?.focus(), []);
	const focusEmail = useCallback(() => emailRef.current?.focus(), []);
	const focusPassword = useCallback(() => passwordRef.current?.focus(), []);
	const focusConfirmPassword = useCallback(() => confirmPasswordRef.current?.focus(), []);

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
					<Text style={styles.title}>Tạo tài khoản</Text>
					<Text style={styles.subtitle}>Bắt đầu hành trình ghi chép cảm xúc của bạn.</Text>
				</Animated.View>

				{/* Form */}
				<Animated.View entering={FadeInDown.duration(400).delay(160)} style={styles.form}>
					<Input
						ref={nameRef}
						label="Họ và tên"
						placeholder="Nguyễn Văn A"
						autoCorrect={false}
						returnKeyType="next"
						onSubmitEditing={focusUsername}
						leftIcon={<Feather name="user" size={s(18)} color={colors.iconDefault} />}
						{...getFieldProps("name")}
					/>

					<Input
						ref={usernameRef}
						label="Tên đăng nhập"
						placeholder="username"
						autoCapitalize="none"
						autoCorrect={false}
						returnKeyType="next"
						onSubmitEditing={focusEmail}
						leftIcon={<Feather name="at-sign" size={s(18)} color={colors.iconDefault} />}
						{...getFieldProps("username")}
					/>

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
						{...getFieldProps("password")}
					/>

					<Input
						ref={confirmPasswordRef}
						label="Nhập lại mật khẩu"
						placeholder="••••••••"
						secureTextEntry={!confirmPasswordVisible}
						autoCapitalize="none"
						autoCorrect={false}
						returnKeyType="done"
						onSubmitEditing={submitForm}
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
						{...getFieldProps("confirmPassword")}
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
						title="Tạo tài khoản"
						variant="primary"
						size="lg"
						fullWidth
						loading={isSubmitting}
						onPress={submitForm}
						accessibilityLabel="Tạo tài khoản mới"
					/>
				</Animated.View>

				{/* Go to login */}
				<Animated.View entering={FadeIn.duration(400).delay(320)} style={styles.loginRow}>
					<Text style={styles.loginPrompt}>Đã có tài khoản? </Text>
					<Pressable
						onPress={handleGoToLogin}
						hitSlop={8}
						accessibilityLabel="Đăng nhập vào tài khoản"
						accessibilityRole="link">
						<Text style={styles.loginLink}>Đăng nhập</Text>
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
		loginRow: {
			flexDirection: "row",
			justifyContent: "center",
			alignItems: "center",
		},
		loginPrompt: {
			color: colors.text.secondary,
			fontSize: FONT_SIZE[14],
			lineHeight: LINE_HEIGHT.normal,
		},
		loginLink: {
			color: colors.text.link,
			fontSize: FONT_SIZE[14],
			lineHeight: LINE_HEIGHT.normal,
			fontWeight: "600",
		},
	});
}
