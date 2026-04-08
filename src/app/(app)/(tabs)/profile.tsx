import { Avatar, Badge, Button, ToggleSwitch } from "@/components";
import { Divider } from "@/components/ui/display/Divider";
import { Input } from "@/components/ui/inputs/Input";
import { ROUTES } from "@/constants";
import { useAuth, useForm, useThemeColors, useThemeContext } from "@/hooks";
import { updateProfileSchema } from "@/schemas";
import { userService } from "@/services";
import { useNotificationStore } from "@/store";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import { s } from "@/utils";
import { ApiError } from "@/utils/error";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// FR-05: Profile / settings screen
export default function ProfileScreen() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const unreadCount = useNotificationStore((s) => s.unreadCount);
	const { user, logout, updateUser } = useAuth();
	const { colorScheme, toggleTheme } = useThemeContext();
	const [isEditing, setIsEditing] = useState(false);

	const { getFieldProps, submitForm, isSubmitting, serverError, reset } = useForm({
		schema: updateProfileSchema,
		defaultValues: { name: user?.name ?? "", username: user?.username ?? "" },
		onSubmit: async (values) => {
			const result = await userService.updateMe(values);
			if (!result.success) throw new ApiError(result.error, result.status ?? 400, result.code);
			await updateUser(result.data);
			setIsEditing(false);
		},
	});

	const handleEditToggle = useCallback(() => {
		if (!isEditing) {
			reset({ name: user?.name ?? "", username: user?.username ?? "" });
		}
		setIsEditing((prev) => !prev);
	}, [isEditing, user, reset]);

	const handleLogout = useCallback(async () => {
		await logout();
		router.replace(ROUTES.LOGIN);
	}, [logout]);

	if (!user) return null;

	const isDark = colorScheme === "dark";

	return (
		<SafeAreaView style={styles.safe}>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled">
				{/* Avatar + Info */}
				<View style={styles.card}>
					<View style={styles.header}>
						<Avatar name={user.name} size="lg" />
						<Text style={styles.displayName}>{user.name}</Text>
						<Text style={styles.username}>@{user.username}</Text>
						<View style={styles.emailRow}>
							<Text style={styles.email}>{user.email}</Text>
							<Badge
								label={user.isEmailVerified ? "Đã xác thực" : "Chưa xác thực"}
								color={
									user.isEmailVerified
										? colors.status.successBackground
										: colors.status.warningBackground
								}
								textColor={user.isEmailVerified ? colors.status.success : colors.status.warning}
								size="sm"
							/>
						</View>
					</View>

					<Button
						title={isEditing ? "Cancel" : "Edit Profile"}
						variant={isEditing ? "ghost" : "outline"}
						size="sm"
						onPress={handleEditToggle}
					/>

					{isEditing && (
						<View style={styles.form}>
							<Input
								label="Display Name"
								placeholder="Your full name"
								autoCapitalize="words"
								autoCorrect={false}
								{...getFieldProps("name")}
							/>
							<Input
								label="Username"
								placeholder="your_username"
								autoCapitalize="none"
								autoCorrect={false}
								{...getFieldProps("username")}
							/>
							{serverError != null && <Text style={styles.serverError}>{serverError}</Text>}
							<Button
								title="Save Changes"
								variant="primary"
								fullWidth
								loading={isSubmitting}
								onPress={submitForm}
							/>
						</View>
					)}
				</View>

				{/* Theme toggle */}
				<View style={styles.card}>
					<ToggleSwitch
						label="Chế độ tối"
						sublabel={isDark ? "Giao diện tối đang bật" : "Giao diện sáng đang bật"}
						value={isDark}
						onValueChange={toggleTheme}
					/>
				</View>

				{/* Notifications */}
				<View style={styles.card}>
					<Pressable
						style={styles.menuRow}
						onPress={() => router.push(ROUTES.NOTIFICATIONS as never)}
						accessibilityLabel="Thông báo"
						accessibilityRole="button">
						<View style={styles.menuRowLeft}>
							<Ionicons name="notifications-outline" size={s(20)} color={colors.iconDefault} />
							<Text style={styles.menuLabel}>Thông báo</Text>
						</View>
						<View style={styles.menuRowRight}>
							{unreadCount > 0 && (
								<View style={styles.notifBadge}>
									<Text style={styles.notifBadgeText}>
										{unreadCount > 99 ? "99+" : unreadCount}
									</Text>
								</View>
							)}
							<Ionicons name="chevron-forward" size={s(16)} color={colors.text.muted} />
						</View>
					</Pressable>
					<Divider />
					<Pressable
						style={styles.menuRow}
						onPress={() => router.push(ROUTES.NOTIFICATION_SETTINGS as never)}
						accessibilityLabel="Cài đặt thông báo"
						accessibilityRole="button">
						<View style={styles.menuRowLeft}>
							<Ionicons name="settings-outline" size={s(20)} color={colors.iconDefault} />
							<Text style={styles.menuLabel}>Cài đặt thông báo</Text>
						</View>
						<Ionicons name="chevron-forward" size={s(16)} color={colors.text.muted} />
					</Pressable>
				</View>

				{/* Logout */}
				<View style={styles.card}>
					<Button title="Đăng xuất" variant="danger" fullWidth onPress={handleLogout} />
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		safe: {
			flex: 1,
			backgroundColor: colors.background.primary,
		},
		scrollContent: {
			paddingHorizontal: SPACING[20],
			paddingBottom: SPACING[48],
			gap: SPACING[16],
		},
		header: {
			alignItems: "center",
			paddingTop: SPACING[32],
			paddingBottom: SPACING[8],
			gap: SPACING[6],
		},
		displayName: {
			fontSize: FONT_SIZE[18],
			fontWeight: "700",
			color: colors.text.primary,
			marginTop: SPACING[12],
		},
		username: {
			fontSize: FONT_SIZE[14],
			color: colors.text.secondary,
		},
		emailRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: SPACING[8],
			flexWrap: "wrap",
			justifyContent: "center",
		},
		email: {
			fontSize: FONT_SIZE[13],
			color: colors.text.muted,
		},
		card: {
			backgroundColor: colors.background.card,
			borderRadius: RADIUS.lg,
			padding: SPACING[16],
			gap: SPACING[12],
		},
		form: {
			gap: SPACING[4],
		},
		serverError: {
			fontSize: FONT_SIZE[13],
			color: colors.status.error,
			borderRadius: RADIUS.sm,
			backgroundColor: colors.status.errorBackground,
			paddingHorizontal: SPACING[12],
			paddingVertical: SPACING[8],
		},
		menuRow: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingVertical: SPACING[4],
		},
		menuRowLeft: {
			flexDirection: "row",
			alignItems: "center",
			gap: SPACING[12],
		},
		menuRowRight: {
			flexDirection: "row",
			alignItems: "center",
			gap: SPACING[8],
		},
		menuLabel: {
			fontSize: FONT_SIZE[15],
			color: colors.text.primary,
		},
		notifBadge: {
			minWidth: s(20),
			height: s(20),
			borderRadius: RADIUS.full,
			backgroundColor: colors.status.error,
			alignItems: "center",
			justifyContent: "center",
			paddingHorizontal: s(5),
		},
		notifBadgeText: {
			fontSize: FONT_SIZE[11],
			lineHeight: LINE_HEIGHT.tight,
			color: colors.text.inverse,
			fontWeight: "700",
		},
	});
}
