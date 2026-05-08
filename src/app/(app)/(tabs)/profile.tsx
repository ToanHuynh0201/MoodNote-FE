import { Avatar, Badge, Button, ScreenWrapper, ToggleSwitch } from "@/components";
import { Divider } from "@/components/ui/display/Divider";
import { Input } from "@/components/ui/inputs/Input";
import { ROUTES } from "@/constants";
import { useAuth, useForm, useThemeColors, useThemeContext, useUserSettings } from "@/hooks";
import { updateProfileSchema } from "@/schemas";
import { userService } from "@/services";
import { useNotificationStore } from "@/store";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import { s } from "@/utils";
import { parseError } from "@/utils/error";
import { ApiError } from "@/utils/error";
import type { ImportData } from "@/types/user.types";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Modal,
	Pressable,
	ScrollView,
	Share,
	StyleSheet,
	Text,
	View,
} from "react-native";

// FR-05: Profile / settings screen
export default function ProfileScreen() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const unreadCount = useNotificationStore((s) => s.unreadCount);
	const { user, logout, updateUser } = useAuth();
	const { colorScheme, toggleTheme } = useThemeContext();
	const { allowTrainingData, isSaving: isSavingSettings, updateAllowTrainingData } = useUserSettings();
	const [isEditing, setIsEditing] = useState(false);

	// ── Data portability state (NFR-11) ─────────────────────────────────────
	const [isExporting, setIsExporting] = useState(false);
	const [isImporting, setIsImporting] = useState(false);
	const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
	const [deletePassword, setDeletePassword] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

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

	// ── NFR-11: Export ───────────────────────────────────────────────────────

	const handleExport = useCallback(async () => {
		setIsExporting(true);
		try {
			const result = await userService.exportData();
			if (!result.success) throw new Error(result.error ?? "Export failed");
			await Share.share({ message: JSON.stringify(result.data, null, 2) });
		} catch {
			Alert.alert("Lỗi", "Không thể xuất dữ liệu. Vui lòng thử lại.");
		} finally {
			setIsExporting(false);
		}
	}, []);

	// ── NFR-11: Import ───────────────────────────────────────────────────────

	const handleImport = useCallback(async () => {
		const pickerResult = await DocumentPicker.getDocumentAsync({
			type: "application/json",
			copyToCacheDirectory: true,
		});
		if (pickerResult.canceled) return;
		setIsImporting(true);
		try {
			const content = await FileSystem.readAsStringAsync(pickerResult.assets[0].uri);
			const data = JSON.parse(content) as ImportData;
			const result = await userService.importData(data);
			if (!result.success) throw new Error(result.error ?? "Import failed");
			Alert.alert(
				"Nhập thành công",
				`Đã nhập ${result.data.importedEntries} nhật ký. Bỏ qua ${result.data.skippedEntries} mục trùng.`,
			);
		} catch {
			Alert.alert("Lỗi", "Không thể nhập dữ liệu. Kiểm tra lại định dạng file.");
		} finally {
			setIsImporting(false);
		}
	}, []);

	// ── NFR-11: Delete account ───────────────────────────────────────────────

	const closeDeleteModal = useCallback(() => {
		setIsDeleteModalVisible(false);
		setDeletePassword("");
		setDeleteError(null);
	}, []);

	const handleDeleteAccount = useCallback(async () => {
		if (!deletePassword.trim()) {
			setDeleteError("Vui lòng nhập mật khẩu.");
			return;
		}
		setIsDeleting(true);
		setDeleteError(null);
		try {
			const result = await userService.deleteAccount({ password: deletePassword });
			if (!result.success) throw new ApiError(result.error, result.status ?? 400, result.code);
			await logout();
			router.replace(ROUTES.LOGIN);
		} catch (err) {
			const { message } = parseError(err);
			setDeleteError(message);
		} finally {
			setIsDeleting(false);
		}
	}, [deletePassword, logout]);

	if (!user) return null;

	const isDark = colorScheme === "dark";

	return (
		<ScreenWrapper padded={false}>
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

				{/* Privacy */}
				<View style={styles.card}>
					<Pressable
						style={styles.menuRow}
						onPress={() => router.push(ROUTES.PRIVACY_SETTINGS as never)}
						accessibilityLabel="Quyền riêng tư"
						accessibilityRole="button">
						<View style={styles.menuRowLeft}>
							<Ionicons name="lock-closed-outline" size={s(20)} color={colors.iconDefault} />
							<Text style={styles.menuLabel}>Quyền riêng tư</Text>
						</View>
						<Ionicons name="chevron-forward" size={s(16)} color={colors.text.muted} />
					</Pressable>
					<Divider />
					<ToggleSwitch
						label="Đóng góp dữ liệu AI"
						sublabel="Gửi nhật ký ẩn danh để cải thiện phân tích cảm xúc"
						value={allowTrainingData}
						onValueChange={(v) => void updateAllowTrainingData(v)}
						disabled={isSavingSettings}
					/>
				</View>

				{/* Data portability (NFR-11) */}
				<View style={styles.card}>
					<Text style={styles.sectionTitle}>Dữ liệu</Text>
					<Pressable
						style={styles.menuRow}
						onPress={() => void handleExport()}
						disabled={isExporting}
						accessibilityLabel="Xuất dữ liệu"
						accessibilityRole="button">
						<View style={styles.menuRowLeft}>
							<Ionicons name="cloud-download-outline" size={s(20)} color={colors.iconDefault} />
							<Text style={styles.menuLabel}>Xuất dữ liệu</Text>
						</View>
						{isExporting ? (
							<ActivityIndicator size="small" color={colors.text.muted} />
						) : (
							<Ionicons name="chevron-forward" size={s(16)} color={colors.text.muted} />
						)}
					</Pressable>
					<Divider />
					<Pressable
						style={styles.menuRow}
						onPress={() => void handleImport()}
						disabled={isImporting}
						accessibilityLabel="Nhập dữ liệu"
						accessibilityRole="button">
						<View style={styles.menuRowLeft}>
							<Ionicons name="cloud-upload-outline" size={s(20)} color={colors.iconDefault} />
							<Text style={styles.menuLabel}>Nhập dữ liệu</Text>
						</View>
						{isImporting ? (
							<ActivityIndicator size="small" color={colors.text.muted} />
						) : (
							<Ionicons name="chevron-forward" size={s(16)} color={colors.text.muted} />
						)}
					</Pressable>
				</View>

				{/* Delete account (NFR-11) */}
				<View style={styles.card}>
					<Button
						title="Xoá tài khoản"
						variant="danger"
						fullWidth
						onPress={() => setIsDeleteModalVisible(true)}
					/>
				</View>

				{/* Logout */}
				<View style={styles.card}>
					<Button title="Đăng xuất" variant="danger" fullWidth onPress={handleLogout} />
				</View>
			</ScrollView>

			{/* Delete account confirmation modal */}
			<Modal
				visible={isDeleteModalVisible}
				transparent
				animationType="fade"
				onRequestClose={closeDeleteModal}>
				<Pressable style={styles.modalOverlay} onPress={closeDeleteModal}>
					<Pressable style={styles.modalCard} onPress={() => {}}>
						<Text style={styles.modalTitle}>Xoá tài khoản</Text>
						<Text style={styles.modalBody}>
							Thao tác này không thể hoàn tác. Tất cả nhật ký và dữ liệu của bạn sẽ bị xoá vĩnh
							viễn.
						</Text>
						<Input
							label="Mật khẩu xác nhận"
							placeholder="Nhập mật khẩu"
							secureTextEntry
							value={deletePassword}
							onChangeText={(t) => {
								setDeletePassword(t);
								setDeleteError(null);
							}}
							error={deleteError ?? undefined}
						/>
						<View style={styles.modalActions}>
							<Button title="Huỷ" variant="ghost" onPress={closeDeleteModal} />
							<Button
								title="Xoá tài khoản"
								variant="danger"
								loading={isDeleting}
								onPress={() => void handleDeleteAccount()}
							/>
						</View>
					</Pressable>
				</Pressable>
			</Modal>
		</ScreenWrapper>
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
		sectionTitle: {
			fontSize: FONT_SIZE[13],
			fontWeight: "600",
			color: colors.text.secondary,
		},
		modalOverlay: {
			flex: 1,
			backgroundColor: colors.background.overlay,
			justifyContent: "center",
			alignItems: "center",
			paddingHorizontal: SPACING[24],
		},
		modalCard: {
			backgroundColor: colors.background.card,
			borderRadius: RADIUS.lg,
			padding: SPACING[24],
			gap: SPACING[16],
			width: "100%",
		},
		modalTitle: {
			fontSize: FONT_SIZE[17],
			fontWeight: "700",
			color: colors.text.primary,
		},
		modalBody: {
			fontSize: FONT_SIZE[14],
			color: colors.text.secondary,
			lineHeight: LINE_HEIGHT.relaxed,
		},
		modalActions: {
			flexDirection: "row",
			justifyContent: "flex-end",
			gap: SPACING[8],
		},
	});
}
