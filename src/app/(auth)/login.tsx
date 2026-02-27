// FR-02: User login
import { Button, Input } from "@/components/ui";
import { ScreenWrapper } from "@/components/layout";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks";
import { useForm } from "@/hooks/useForm";
import { loginSchema } from "@/schemas";
import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function LoginScreen() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { login } = useAuth();
	const [passwordVisible, setPasswordVisible] = useState(false);

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

	return (
		<ScreenWrapper keyboard>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				{/* Heading */}
				<View style={styles.heading}>
					<Text style={styles.title}>Đăng nhập</Text>
				</View>

				{/* Form */}
				<View style={styles.form}>
					<Input
						label="Tên đăng nhập"
						placeholder="email@example.com"
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
						leftIcon={
							<Feather name="user" size={18} color={colors.iconDefault} />
						}
						{...getFieldProps("email")}
					/>

					<Input
						label="Mật khẩu"
						placeholder="••••••••"
						secureTextEntry={!passwordVisible}
						autoCapitalize="none"
						autoCorrect={false}
						leftIcon={
							<Feather name="lock" size={18} color={colors.iconDefault} />
						}
						rightIcon={
							<Pressable
								onPress={togglePasswordVisible}
								hitSlop={8}
								accessibilityLabel={passwordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
								accessibilityRole="button"
							>
								<Feather
									name={passwordVisible ? "eye-off" : "eye"}
									size={18}
									color={colors.iconDefault}
								/>
							</Pressable>
						}
						{...getFieldProps("password")}
					/>

					{/* Server error */}
					{serverError ? (
						<View style={styles.errorBanner}>
							<Text style={styles.errorText}>{serverError}</Text>
						</View>
					) : null}

					{/* Forgot password */}
					<Pressable
						style={styles.forgotWrapper}
						onPress={handleForgotPassword}
						hitSlop={8}
						accessibilityLabel="Quên mật khẩu"
						accessibilityRole="link"
					>
						<Text style={styles.forgotText}>Quên mật khẩu?</Text>
					</Pressable>
				</View>

				{/* Submit */}
				<Button
					title="Đăng nhập"
					variant="primary"
					size="lg"
					fullWidth
					loading={isSubmitting}
					onPress={submitForm}
					accessibilityLabel="Đăng nhập vào tài khoản"
				/>

				{/* Go to register */}
				<View style={styles.registerRow}>
					<Text style={styles.registerPrompt}>Chưa có tài khoản? </Text>
					<Pressable
						onPress={handleGoToRegister}
						hitSlop={8}
						accessibilityLabel="Tạo tài khoản mới"
						accessibilityRole="link"
					>
						<Text style={styles.registerLink}>Đăng kí</Text>
					</Pressable>
				</View>
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
			paddingTop: 32,
			paddingBottom: 32,
			gap: 24,
		},
		heading: {
			alignItems: "center",
		},
		title: {
			color: colors.text.primary,
			fontSize: 28,
			fontWeight: "700",
		},
		form: {
			gap: 16,
		},
		errorBanner: {
			backgroundColor: colors.status.errorBackground,
			borderRadius: 10,
			padding: 12,
		},
		errorText: {
			color: colors.status.error,
			fontSize: 13,
			textAlign: "center",
		},
		forgotWrapper: {
			alignSelf: "flex-end",
		},
		forgotText: {
			color: colors.text.link,
			fontSize: 13,
			fontWeight: "500",
		},
		registerRow: {
			flexDirection: "row",
			justifyContent: "center",
			alignItems: "center",
		},
		registerPrompt: {
			color: colors.text.secondary,
			fontSize: 14,
		},
		registerLink: {
			color: colors.text.link,
			fontSize: 14,
			fontWeight: "600",
		},
	});
}
