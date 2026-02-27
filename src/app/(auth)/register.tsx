// FR-01: User registration
import { Button, Input } from "@/components/ui";
import { ScreenWrapper } from "@/components/layout";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks";
import { useForm } from "@/hooks/useForm";
import { registerSchema } from "@/schemas";
import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function RegisterScreen() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { register } = useAuth();
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

	const { getFieldProps, submitForm, isSubmitting, serverError } = useForm({
		schema: registerSchema,
		defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
		onSubmit: async (values) => {
			await register(values);
			router.replace(ROUTES.LOGIN);
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
					<Text style={styles.title}>Đăng kí</Text>
				</View>

				{/* Form */}
				<View style={styles.form}>
					<Input
						label="Tên đăng nhập"
						placeholder="username"
						autoCapitalize="none"
						autoCorrect={false}
						leftIcon={
							<Feather name="user" size={18} color={colors.iconDefault} />
						}
						{...getFieldProps("username")}
					/>

					<Input
						label="Email"
						placeholder="email@example.com"
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
						leftIcon={
							<Feather name="mail" size={18} color={colors.iconDefault} />
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

					<Input
						label="Nhập lại mật khẩu"
						placeholder="••••••••"
						secureTextEntry={!confirmPasswordVisible}
						autoCapitalize="none"
						autoCorrect={false}
						leftIcon={
							<Feather name="lock" size={18} color={colors.iconDefault} />
						}
						rightIcon={
							<Pressable
								onPress={toggleConfirmPasswordVisible}
								hitSlop={8}
								accessibilityLabel={
									confirmPasswordVisible ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"
								}
								accessibilityRole="button"
							>
								<Feather
									name={confirmPasswordVisible ? "eye-off" : "eye"}
									size={18}
									color={colors.iconDefault}
								/>
							</Pressable>
						}
						{...getFieldProps("confirmPassword")}
					/>

					{/* Server error */}
					{serverError ? (
						<View style={styles.errorBanner}>
							<Text style={styles.errorText}>{serverError}</Text>
						</View>
					) : null}
				</View>

				{/* Submit */}
				<Button
					title="Tạo tài khoản"
					variant="primary"
					size="lg"
					fullWidth
					loading={isSubmitting}
					onPress={submitForm}
					accessibilityLabel="Tạo tài khoản mới"
				/>

				{/* Go to login */}
				<View style={styles.loginRow}>
					<Text style={styles.loginPrompt}>Đã có tài khoản? </Text>
					<Pressable
						onPress={handleGoToLogin}
						hitSlop={8}
						accessibilityLabel="Đăng nhập vào tài khoản"
						accessibilityRole="link"
					>
						<Text style={styles.loginLink}>Đăng nhập</Text>
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
		loginRow: {
			flexDirection: "row",
			justifyContent: "center",
			alignItems: "center",
		},
		loginPrompt: {
			color: colors.text.secondary,
			fontSize: 14,
		},
		loginLink: {
			color: colors.text.link,
			fontSize: 14,
			fontWeight: "600",
		},
	});
}
