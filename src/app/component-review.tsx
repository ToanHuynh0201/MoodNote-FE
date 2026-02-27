/**
 * Dev-only component review screen — navigate to /component-review
 * Showcases every UI component in the MoodNote design system.
 */

import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
	Avatar,
	Badge,
	Button,
	Card,
	ConfirmationDialog,
	Divider,
	EmptyState,
	EmotionIllustration,
	IconButton,
	Input,
	JournalIllustration,
	LoadingSpinner,
	Modal,
	MusicIllustration,
	ProgressBar,
	SearchBar,
	SectionHeader,
	SegmentedControl,
	SkeletonLoader,
	StatusIndicator,
	TextArea,
	ToggleSwitch,
	ToastProvider,
	useToast,
	WavyLoader,
} from "@/components/ui";
import { useThemeColors, useThemeContext } from "@/hooks";
import type { ThemeColors } from "@/theme";

// ─── Helper: Section ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: ReactNode }) {
	const colors = useThemeColors();
	const styles = useMemo(() => createSectionStyles(colors), [colors]);
	return (
		<View style={styles.wrapper}>
			<View style={styles.heading}>
				<Text style={styles.title}>{title}</Text>
			</View>
			{children}
		</View>
	);
}

// ─── Helper: Block — shows component name + the component ─────────────────────

function Block({ label, children }: { label: string; children: ReactNode }) {
	const colors = useThemeColors();
	const styles = useMemo(() => createBlockStyles(colors), [colors]);
	return (
		<View style={styles.wrapper}>
			<Text style={styles.label}>{label}</Text>
			{children}
		</View>
	);
}

// ─── Helper: Row — horizontal flex wrap ────────────────────────────────────────

function Row({ children, gap = 8 }: { children: ReactNode; gap?: number }) {
	return <View style={{ flexDirection: "row", flexWrap: "wrap", gap, alignItems: "center" }}>{children}</View>;
}

// ─── Review Content ────────────────────────────────────────────────────────────

function ReviewContent() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { colorScheme, toggleTheme } = useThemeContext();
	const { show } = useToast();

	// Interactive states
	const [toggleA, setToggleA] = useState(false);
	const [toggleB, setToggleB] = useState(true);
	const [segValue, setSegValue] = useState("7d");
	const [searchText, setSearchText] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const [confirmPrimary, setConfirmPrimary] = useState(false);
	const [confirmDanger, setConfirmDanger] = useState(false);

	const showSuccess = useCallback(() => show({ message: "Đã lưu thành công!", type: "success" }), [show]);
	const showError = useCallback(() => show({ message: "Đã xảy ra lỗi.", type: "error" }), [show]);
	const showWarning = useCallback(() => show({ message: "Cảnh báo: pin yếu.", type: "warning" }), [show]);
	const showInfo = useCallback(() => show({ message: "Phân tích cảm xúc xong.", type: "info" }), [show]);

	return (
		<SafeAreaView style={styles.screen}>
			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

				{/* Page header */}
				<View style={styles.pageHeader}>
					<View>
						<Text style={styles.pageTitle}>UI Components</Text>
						<Text style={styles.pageSubtitle}>MoodNote design system</Text>
					</View>
					<IconButton
						icon={
							<Ionicons
								name={colorScheme === "dark" ? "sunny-outline" : "moon-outline"}
								size={22}
								color={colors.iconDefault}
							/>
						}
						onPress={toggleTheme}
						accessibilityLabel={colorScheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
						variant="filled"
						size="md"
					/>
				</View>

				{/* ── BUTTONS ───────────────────────────────────────── */}
				<Section title="Button">
					<Block label="variant">
						<Row>
							<Button title="Primary" onPress={() => {}} />
							<Button title="Secondary" onPress={() => {}} variant="secondary" />
							<Button title="Outline" onPress={() => {}} variant="outline" />
							<Button title="Ghost" onPress={() => {}} variant="ghost" />
							<Button title="Danger" onPress={() => {}} variant="danger" />
						</Row>
					</Block>
					<Block label="size">
						<Row gap={10}>
							<Button title="sm" onPress={() => {}} size="sm" />
							<Button title="md" onPress={() => {}} size="md" />
							<Button title="lg" onPress={() => {}} size="lg" />
						</Row>
					</Block>
					<Block label="leftIcon / rightIcon">
						<Row>
							<Button
								title="Thêm"
								onPress={() => {}}
								leftIcon={<Ionicons name="add" size={16} color={colors.text.inverse} />}
							/>
							<Button
								title="Tiếp theo"
								onPress={() => {}}
								variant="outline"
								rightIcon={<Ionicons name="arrow-forward" size={16} color={colors.brand.primary} />}
							/>
						</Row>
					</Block>
					<Block label="state">
						<Row>
							<Button title="Loading" onPress={() => {}} loading />
							<Button title="Disabled" onPress={() => {}} disabled />
						</Row>
					</Block>
					<Block label="fullWidth">
						<Button title="Full width button" onPress={() => {}} fullWidth />
					</Block>
				</Section>

				<Section title="IconButton">
					<Block label="variant">
						<Row gap={12}>
							<View style={styles.iconBtnGroup}>
								<Text style={styles.iconBtnHint}>ghost</Text>
								<IconButton icon={<Ionicons name="heart-outline" size={20} color={colors.iconDefault} />} onPress={() => {}} accessibilityLabel="Like" variant="ghost" />
							</View>
							<View style={styles.iconBtnGroup}>
								<Text style={styles.iconBtnHint}>filled</Text>
								<IconButton icon={<Ionicons name="heart-outline" size={20} color={colors.iconDefault} />} onPress={() => {}} accessibilityLabel="Like" variant="filled" />
							</View>
							<View style={styles.iconBtnGroup}>
								<Text style={styles.iconBtnHint}>outline</Text>
								<IconButton icon={<Ionicons name="heart-outline" size={20} color={colors.iconDefault} />} onPress={() => {}} accessibilityLabel="Like" variant="outline" />
							</View>
						</Row>
					</Block>
					<Block label="size">
						<Row gap={12}>
							<View style={styles.iconBtnGroup}>
								<Text style={styles.iconBtnHint}>sm</Text>
								<IconButton icon={<Ionicons name="star-outline" size={14} color={colors.iconDefault} />} onPress={() => {}} accessibilityLabel="Star" size="sm" variant="filled" />
							</View>
							<View style={styles.iconBtnGroup}>
								<Text style={styles.iconBtnHint}>md</Text>
								<IconButton icon={<Ionicons name="star-outline" size={18} color={colors.iconDefault} />} onPress={() => {}} accessibilityLabel="Star" size="md" variant="filled" />
							</View>
							<View style={styles.iconBtnGroup}>
								<Text style={styles.iconBtnHint}>lg</Text>
								<IconButton icon={<Ionicons name="star-outline" size={22} color={colors.iconDefault} />} onPress={() => {}} accessibilityLabel="Star" size="lg" variant="filled" />
							</View>
						</Row>
					</Block>
				</Section>

				<Divider spacing={4} />

				{/* ── INPUTS ────────────────────────────────────────── */}
				<Section title="Input">
					<Block label="default">
						<Input placeholder="Placeholder..." />
					</Block>
					<Block label="label + hint">
						<Input label="Email" hint="Nhập địa chỉ email của bạn" placeholder="hello@example.com" />
					</Block>
					<Block label="error">
						<Input label="Mật khẩu" error="Mật khẩu phải có ít nhất 8 ký tự" placeholder="••••••••" secureTextEntry />
					</Block>
					<Block label="icons">
						<Input
							placeholder="Tìm kiếm..."
							leftIcon={<Ionicons name="search" size={18} color={colors.text.muted} />}
							rightIcon={<Ionicons name="options-outline" size={18} color={colors.text.muted} />}
						/>
					</Block>
				</Section>

				<Section title="TextArea">
					<Block label="with char count">
						<TextArea
							label="Nhật ký"
							placeholder="Hôm nay bạn cảm thấy thế nào?&#10;Hãy chia sẻ suy nghĩ của bạn..."
							maxLength={5000}
							showCharCount
							hint="Mỗi entry tối đa 5000 ký tự"
						/>
					</Block>
				</Section>

				<Section title="SearchBar">
					<Block label="interactive (có clear button)">
						<SearchBar value={searchText} onChangeText={setSearchText} placeholder="Tìm bài hát..." />
					</Block>
				</Section>

				<Section title="ToggleSwitch">
					<Block label="off">
						<ToggleSwitch value={toggleA} onValueChange={setToggleA} label="Thông báo" />
					</Block>
					<Block label="on + sublabel">
						<ToggleSwitch value={toggleB} onValueChange={setToggleB} label="Dark Mode" sublabel="Giao diện tối giúp giảm mỏi mắt" />
					</Block>
					<Block label="disabled">
						<ToggleSwitch value={true} onValueChange={() => {}} label="Tính năng beta" sublabel="Đang phát triển" disabled />
					</Block>
				</Section>

				<Section title="SegmentedControl">
					<Block label="interactive">
						<SegmentedControl
							options={[
								{ label: "7 ngày", value: "7d" },
								{ label: "30 ngày", value: "30d" },
								{ label: "90 ngày", value: "90d" },
							]}
							value={segValue}
							onChange={setSegValue}
						/>
					</Block>
					<Block label="mirror / shift mode">
						<SegmentedControl
							options={[
								{ label: "Mirror", value: "mirror" },
								{ label: "Shift", value: "shift" },
							]}
							value="mirror"
							onChange={() => {}}
						/>
					</Block>
				</Section>

				<Divider spacing={4} />

				{/* ── DISPLAY ───────────────────────────────────────── */}
				<Section title="Card">
					<Block label="elevated (default)">
						<Card><Text style={styles.cardText}>Elevated — có shadow</Text></Card>
					</Block>
					<Block label="flat">
						<Card variant="flat"><Text style={styles.cardText}>Flat — không shadow</Text></Card>
					</Block>
					<Block label="bordered">
						<Card variant="bordered"><Text style={styles.cardText}>Bordered — viền mảnh</Text></Card>
					</Block>
					<Block label="padding={false}">
						<Card padding={false} variant="bordered">
							<Text style={styles.cardNoPaddingText}>No padding — content tự quản lý spacing</Text>
						</Card>
					</Block>
				</Section>

				<Section title="Badge">
					<Block label="emotion tags">
						<Row>
							<Badge label="Vui vẻ" color={colors.mood.enjoyment} textColor={colors.text.inverse} />
							<Badge label="Buồn" color={colors.mood.sadness} textColor={colors.text.inverse} />
							<Badge label="Tức giận" color={colors.mood.anger} textColor={colors.text.inverse} />
							<Badge label="Sợ hãi" color={colors.mood.fear} textColor={colors.text.inverse} />
						</Row>
					</Block>
					<Block label="size sm">
						<Row>
							<Badge label="sm badge" size="sm" />
							<Badge label="#nhật-ký" size="sm" />
						</Row>
					</Block>
					<Block label="dismissible">
						<Row>
							<Badge label="#âm-nhạc" onDismiss={() => {}} />
							<Badge label="#thư-giãn" onDismiss={() => {}} />
						</Row>
					</Block>
					<Block label="pressable">
						<Row><Badge label="Tap me ›" onPress={() => {}} /></Row>
					</Block>
				</Section>

				<Section title="Avatar">
					<Block label="initials fallback (sm / md / lg)">
						<Row gap={12}>
							<Avatar name="Nguyen Van A" size="sm" />
							<Avatar name="Nguyen Van A" size="md" />
							<Avatar name="Nguyen Van A" size="lg" />
						</Row>
					</Block>
					<Block label="single word + no name">
						<Row gap={12}>
							<Avatar name="MoodNote" size="md" />
							<Avatar size="md" />
						</Row>
					</Block>
				</Section>

				<Section title="Divider">
					<Block label="plain">
						<Divider />
					</Block>
					<Block label='label="hoặc"'>
						<Divider label="hoặc" />
					</Block>
				</Section>

				<Section title="ProgressBar">
					<Block label="0%"><ProgressBar value={0} /></Block>
					<Block label="30%"><ProgressBar value={30} /></Block>
					<Block label="75% + showLabel"><ProgressBar value={75} showLabel /></Block>
					<Block label="100% success color">
						<ProgressBar value={100} color={colors.status.success} />
					</Block>
					<Block label="intensity (emotion)">
						<ProgressBar value={82} color={colors.mood.enjoyment} height={10} showLabel />
					</Block>
				</Section>

				<Section title="SectionHeader">
					<Block label="title only">
						<SectionHeader title="Nhật ký gần đây" />
					</Block>
					<Block label="with action">
						<SectionHeader title="Gợi ý âm nhạc" action={{ label: "Xem tất cả", onPress: () => {} }} />
					</Block>
				</Section>

				<Divider spacing={4} />

				{/* ── FEEDBACK ──────────────────────────────────────── */}
				<Section title="LoadingSpinner">
					<Block label="inline small">
						<LoadingSpinner size="small" overlay={false} />
					</Block>
					<Block label="inline large + message">
						<LoadingSpinner size="large" overlay={false} message="Đang phân tích cảm xúc..." />
					</Block>
					<Block label="overlay (full-screen) — không demo được trong scroll">
						<Text style={styles.noteText}>Dùng &lt;LoadingSpinner /&gt; mặc định để hiển thị full-screen.</Text>
					</Block>
				</Section>

				<Section title="WavyLoader">
					<Block label="mặc định — gradient (brand.secondary → brand.primary)">
						<WavyLoader />
					</Block>
					<Block label="7 bars">
						<WavyLoader barCount={7} />
					</Block>
					<Block label="gradient tùy chỉnh (enjoyment → brand.primary)">
						<WavyLoader gradientColors={[colors.mood.enjoyment, colors.brand.primary]} />
					</Block>
					<Block label="solid color (color prop)">
						<WavyLoader color={colors.mood.enjoyment} />
					</Block>
					<Block label="bars cao hơn (barHeight=60)">
						<WavyLoader barHeight={60} barWidth={6} gap={6} />
					</Block>
				</Section>

				<Section title="SkeletonLoader">
					<Block label="text lines">
						<View style={styles.skeletonGroup}>
							<SkeletonLoader height={14} width="85%" />
							<SkeletonLoader height={14} width="60%" />
							<SkeletonLoader height={14} width="75%" />
						</View>
					</Block>
					<Block label="card placeholder">
						<SkeletonLoader height={80} borderRadius={12} />
					</Block>
					<Block label="avatar circle">
						<SkeletonLoader width={44} height={44} borderRadius={22} />
					</Block>
				</Section>

				<Section title="Toast">
					<Block label="trigger (tap để xem)">
						<Row>
							<Button title="Success" onPress={showSuccess} variant="outline" size="sm" />
							<Button title="Error" onPress={showError} variant="outline" size="sm" />
							<Button title="Warning" onPress={showWarning} variant="outline" size="sm" />
							<Button title="Info" onPress={showInfo} variant="outline" size="sm" />
						</Row>
					</Block>
				</Section>

				<Section title="StatusIndicator">
					<Block label="all states">
						<View style={styles.statusGroup}>
							<StatusIndicator status="saving" />
							<StatusIndicator status="saved" />
							<StatusIndicator status="error" />
							<StatusIndicator status="online" />
							<StatusIndicator status="offline" />
						</View>
					</Block>
					<Block label="dot only (showLabel=false)">
						<Row gap={14}>
							<StatusIndicator status="saving" showLabel={false} />
							<StatusIndicator status="saved" showLabel={false} />
							<StatusIndicator status="error" showLabel={false} />
						</Row>
					</Block>
				</Section>

				<Section title="EmptyState">
					<Block label="icon + subtitle + action">
						<Card variant="bordered">
							<EmptyState
								icon={<Ionicons name="journal-outline" size={40} color={colors.text.muted} />}
								title="Chưa có nhật ký"
								subtitle="Hãy viết nhật ký đầu tiên để bắt đầu hành trình cảm xúc của bạn."
								action={{ label: "Viết ngay", onPress: () => {} }}
							/>
						</Card>
					</Block>
					<Block label="no icon, no action">
						<Card variant="bordered">
							<EmptyState title="Không tìm thấy kết quả" subtitle="Thử tìm kiếm với từ khoá khác." />
						</Card>
					</Block>
				</Section>

				<Divider spacing={4} />

				{/* ── ILLUSTRATIONS ─────────────────────────────────── */}
				<Section title="Illustrations">
					<Block label="JournalIllustration">
						<Row>
							<JournalIllustration />
						</Row>
					</Block>
					<Block label="EmotionIllustration">
						<Row>
							<EmotionIllustration />
						</Row>
					</Block>
					<Block label="MusicIllustration">
						<Row>
							<MusicIllustration />
						</Row>
					</Block>
				</Section>

				<Divider spacing={4} />

				{/* ── OVERLAY ───────────────────────────────────────── */}
				<Section title="Modal">
					<Block label="slide-up với title + dismiss">
						<Button title="Mở Modal" onPress={() => setModalVisible(true)} variant="outline" />
						<Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} title="Chi tiết nhật ký">
							<View style={styles.modalBody}>
								<Text style={styles.modalText}>
									Đây là nội dung bên trong Modal. Bấm vào vùng backdrop hoặc nút × để đóng.
								</Text>
								<Divider />
								<Button title="Đóng" onPress={() => setModalVisible(false)} fullWidth />
							</View>
						</Modal>
					</Block>
				</Section>

				<Section title="ConfirmationDialog">
					<Block label="primary variant">
						<Button title="Xác nhận hành động" onPress={() => setConfirmPrimary(true)} variant="outline" size="sm" />
						<ConfirmationDialog
							visible={confirmPrimary}
							title="Xác nhận hành động"
							message="Bạn có chắc chắn muốn tiếp tục không? Hành động sẽ được thực hiện ngay lập tức."
							onConfirm={() => setConfirmPrimary(false)}
							onCancel={() => setConfirmPrimary(false)}
						/>
					</Block>
					<Block label="danger variant">
						<Button title="Xoá nhật ký" onPress={() => setConfirmDanger(true)} variant="danger" size="sm" />
						<ConfirmationDialog
							visible={confirmDanger}
							title="Xoá nhật ký?"
							message="Hành động này không thể hoàn tác. Toàn bộ nội dung sẽ bị xoá vĩnh viễn."
							confirmLabel="Xoá"
							confirmVariant="danger"
							onConfirm={() => setConfirmDanger(false)}
							onCancel={() => setConfirmDanger(false)}
						/>
					</Block>
				</Section>

				<View style={styles.bottomSpacer} />
			</ScrollView>
		</SafeAreaView>
	);
}

// ─── Root export (wraps with ToastProvider) ────────────────────────────────────

export default function ComponentReviewScreen() {
	return (
		<ToastProvider>
			<ReviewContent />
		</ToastProvider>
	);
}

// ─── Styles ────────────────────────────────────────────────────────────────────

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		screen: { flex: 1, backgroundColor: colors.background.primary },
		content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },

		// Page header
		pageHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
		pageTitle: { fontSize: 28, fontWeight: "800", color: colors.text.primary, marginBottom: 4 },
		pageSubtitle: { fontSize: 14, color: colors.text.muted },

		// Card demo text
		cardText: { fontSize: 14, color: colors.text.secondary },
		cardNoPaddingText: { fontSize: 14, color: colors.text.secondary, padding: 12 },

		// IconButton helper
		iconBtnGroup: { alignItems: "center", gap: 4 },
		iconBtnHint: { fontSize: 10, color: colors.text.muted },

		// SkeletonLoader group
		skeletonGroup: { gap: 8 },

		// StatusIndicator group
		statusGroup: { gap: 14 },

		// Note text
		noteText: { fontSize: 13, color: colors.text.muted, fontStyle: "italic" },

		// Modal body
		modalBody: { paddingTop: 4, paddingBottom: 8, gap: 16 },
		modalText: { fontSize: 15, color: colors.text.secondary, lineHeight: 22 },

		bottomSpacer: { height: 40 },
	});
}

function createSectionStyles(colors: ThemeColors) {
	return StyleSheet.create({
		wrapper: { marginBottom: 24 },
		heading: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: 12,
			gap: 8,
		},
		title: {
			fontSize: 18,
			fontWeight: "700",
			color: colors.text.primary,
			paddingBottom: 4,
			borderBottomWidth: 2,
			borderBottomColor: colors.brand.primary,
		},
	});
}

function createBlockStyles(colors: ThemeColors) {
	return StyleSheet.create({
		wrapper: { marginBottom: 14 },
		label: {
			fontSize: 11,
			fontWeight: "600",
			color: colors.text.muted,
			textTransform: "uppercase",
			letterSpacing: 0.8,
			marginBottom: 8,
		},
	});
}
