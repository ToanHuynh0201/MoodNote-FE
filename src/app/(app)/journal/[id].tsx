// FR-06, FR-09: Journal entry detail and edit screen with auto-save

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import Animated, {
	Easing,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

import { Badge } from "@/components/ui/display/Badge";
import { Button } from "@/components/ui/buttons/Button";
import { EmotionAnalysisCard, EntryDetailSkeleton, RichTextEditor, SaveStatusBanner } from "@/components/journal";
import type { RichTextEditorRef } from "@/components/journal";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { ANALYSIS_STATUS_LABELS } from "@/constants/journal";
import { useAnalysisPolling, useAutoSave, useEntry, useForm, useThemeColors } from "@/hooks";
import { entryService } from "@/services";
import { editEntryFormSchema } from "@/schemas/entry.schemas";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import { htmlToText, s, vs } from "@/utils";
import type { QuillDelta } from "@/types/entry.types";

export default function EntryDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const { entry, isLoading, error, updateEntry, deleteEntry } = useEntry(id);

	// currentEntry tracks the displayed entry — starts from `entry`, updated by polling
	const [currentEntry, setCurrentEntry] = useState(entry);
	useEffect(() => {
		if (entry) setCurrentEntry(entry);
	}, [entry]);

	const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);
	const expandProgress = useSharedValue(0);

	const toggleAnalysis = useCallback(() => {
		const toValue = isAnalysisExpanded ? 0 : 1;
		expandProgress.value = withTiming(toValue, {
			duration: 280,
			easing: Easing.out(Easing.cubic),
		});
		setIsAnalysisExpanded((prev) => !prev);
	}, [isAnalysisExpanded, expandProgress]);

	const cardAnimStyle = useAnimatedStyle(() => ({
		maxHeight: interpolate(expandProgress.value, [0, 1], [0, 600]),
		opacity: expandProgress.value,
		overflow: "hidden",
	}));

	const chevronAnimStyle = useAnimatedStyle(() => ({
		transform: [
			{ rotate: `${interpolate(expandProgress.value, [0, 1], [0, 180])}deg` },
		],
	}));

	const [tagInput, setTagInput] = useState("");

	// Rich text editor state — managed outside react-hook-form
	const deltaRef = useRef<QuillDelta>({ ops: [{ insert: "\n" }] });
	const editorRef = useRef<RichTextEditorRef>(null);

	const { watch, setValue, reset } = useForm({
		schema: editEntryFormSchema,
		defaultValues: { title: "", tags: [] },
		onSubmit: async () => {},
	});

	const currentTags = watch("tags") ?? [];
	const titleValue = watch("title") ?? "";

	// Populate form and deltaRef when entry loads (use entry, not currentEntry, to avoid
	// resetting the form mid-edit when polling updates analysis state)
	useEffect(() => {
		if (!entry) return;
		reset({
			title: entry.title ?? "",
			tags: entry.tags,
		});
		deltaRef.current = entry.content;
	}, [entry, reset]);

	// ── Analysis polling (FR-10) ─────────────────────────────────────────────

	useAnalysisPolling({
		entryId: entry?.id ?? null,
		currentStatus: currentEntry?.analysisStatus ?? "PENDING",
		onUpdate: setCurrentEntry,
	});

	// ── Auto-save ────────────────────────────────────────────────────────────

	const saveFn = useCallback(async () => {
		const html = (await editorRef.current?.getContentHtml()) ?? "";
		if (htmlToText(html).length < 10) return;

		const title = watch("title") ?? "";
		const tags = watch("tags") ?? [];

		await updateEntry({
			content: deltaRef.current,
			title: title.trim() || undefined,
			tags,
		});
	}, [watch, updateEntry]);

	const { saveStatus, triggerSave, triggerImmediately } = useAutoSave({ saveFn });

	// ── Tag management (FR-08) ───────────────────────────────────────────────

	const addTag = useCallback(() => {
		const trimmed = tagInput.trim().toLowerCase();
		if (!trimmed || currentTags.includes(trimmed) || currentTags.length >= 5) return;
		setValue("tags", [...currentTags, trimmed], { shouldDirty: true });
		setTagInput("");
		triggerSave();
	}, [tagInput, currentTags, setValue, triggerSave]);

	const removeTag = useCallback(
		(tag: string) => {
			setValue(
				"tags",
				currentTags.filter((t) => t !== tag),
				{ shouldDirty: true },
			);
			triggerSave();
		},
		[currentTags, setValue, triggerSave],
	);

	// ── Delete (FR-09) ───────────────────────────────────────────────────────

	const handleDelete = useCallback(() => {
		Alert.alert(
			"Xoá nhật ký",
			"Bạn có chắc muốn xoá nhật ký này? Thao tác không thể hoàn tác.",
			[
				{ text: "Huỷ", style: "cancel" },
				{
					text: "Xoá",
					style: "destructive",
					onPress: async () => {
						try {
							await deleteEntry();
							router.back();
						} catch {
							Alert.alert("Lỗi", "Không thể xoá nhật ký. Vui lòng thử lại.");
						}
					},
				},
			],
		);
	}, [deleteEntry]);

	// ── Retry analysis (FR-10) ──────────────────────────────────────────────

	const handleRetryAnalysis = useCallback(async () => {
		if (!entry?.id) return;
		const result = await entryService.triggerAnalysis(entry.id);
		if (!result.success) {
			Alert.alert("Lỗi", "Không thể kích hoạt phân tích. Vui lòng thử lại.");
			return;
		}
		setCurrentEntry((prev) => (prev ? { ...prev, analysisStatus: "PROCESSING" } : prev));
	}, [entry?.id]);

	// ── Loading / error states ────────────────────────────────────────────────

	if (isLoading) {
		return <EntryDetailSkeleton />;
	}

	if (error || !currentEntry) {
		return (
			<ScreenWrapper padded={false} style={styles.centered}>
				<Text style={styles.errorText}>{error ?? "Không tìm thấy nhật ký."}</Text>
				<Pressable onPress={() => router.back()} style={styles.backLink}>
					<Text style={styles.backLinkText}>Quay lại</Text>
				</Pressable>
			</ScreenWrapper>
		);
	}

	const statusColor = {
		PENDING: colors.text.muted,
		PROCESSING: colors.status.info,
		COMPLETED: colors.status.success,
		FAILED: colors.status.error,
	}[currentEntry.analysisStatus] ?? colors.text.muted;

	return (
		<ScreenWrapper padded={false}>
			{/* Header */}
			<View style={styles.header}>
				<Pressable
					onPress={() => router.back()}
					hitSlop={8}
					accessibilityRole="button"
					accessibilityLabel="Quay lại">
					<Ionicons name="chevron-back" size={s(24)} color={colors.text.primary} />
				</Pressable>
				<SaveStatusBanner status={saveStatus} />
				<Pressable
					onPress={handleDelete}
					hitSlop={8}
					accessibilityRole="button"
					accessibilityLabel="Xoá nhật ký">
					<Ionicons name="trash-outline" size={s(22)} color={colors.status.error} />
				</Pressable>
			</View>

			<KeyboardAvoidingView
				style={styles.flex}
				behavior={Platform.OS === "ios" ? "padding" : "height"}>
				<ScrollView
					style={styles.flex}
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}>

					{/* Analysis status — tappable dropdown when COMPLETED */}
					<Pressable
						style={styles.statusRow}
						onPress={
							currentEntry.analysisStatus === "COMPLETED" && currentEntry.emotionAnalysis
								? toggleAnalysis
								: undefined
						}
						accessibilityRole={
							currentEntry.analysisStatus === "COMPLETED" && currentEntry.emotionAnalysis
								? "button"
								: undefined
						}
						accessibilityLabel={
							currentEntry.analysisStatus === "COMPLETED" && currentEntry.emotionAnalysis
								? isAnalysisExpanded
									? "Ẩn phân tích cảm xúc"
									: "Xem phân tích cảm xúc"
								: undefined
						}>
						<View style={[styles.statusDot, { backgroundColor: statusColor }]} />
						<Text style={[styles.statusText, { color: statusColor }]}>
							{ANALYSIS_STATUS_LABELS[currentEntry.analysisStatus] ?? currentEntry.analysisStatus}
						</Text>
						{currentEntry.analysisStatus === "COMPLETED" && currentEntry.emotionAnalysis && (
							<Animated.View style={chevronAnimStyle}>
								<Ionicons name="chevron-down" size={s(14)} color={statusColor} />
							</Animated.View>
						)}
					</Pressable>

					{/* Emotion analysis result (FR-10) */}
					{currentEntry.analysisStatus === "COMPLETED" && currentEntry.emotionAnalysis && (
						<Animated.View style={cardAnimStyle}>
							<EmotionAnalysisCard analysis={currentEntry.emotionAnalysis} />
						</Animated.View>
					)}

					{/* Retry analysis button (FR-10) */}
					{currentEntry.analysisStatus === "FAILED" && entry?.id && (
						<Button
							title="Phân tích lại"
							onPress={() => void handleRetryAnalysis()}
							variant="outline"
							size="sm"
						/>
					)}

					{/* Title */}
					<TextInput
						style={styles.titleInput}
						placeholder="Tiêu đề (tùy chọn)"
						placeholderTextColor={colors.text.placeholder}
						value={titleValue}
						onChangeText={(text) => {
							setValue("title", text, { shouldDirty: true });
							triggerSave();
						}}
						maxLength={100}
						returnKeyType="next"
					/>

					{/* Content — rich text editor (FR-06) */}
					<RichTextEditor
						ref={editorRef}
						initialDelta={currentEntry.content}
						placeholder="Nội dung nhật ký..."
						minHeight={vs(300)}
						onChange={(delta) => {
							deltaRef.current = delta;
							triggerSave();
						}}
						onBlur={() => void triggerImmediately()}
					/>

					{/* Tags (FR-08) */}
					<View style={styles.tagsSection}>
						<Text style={styles.tagsLabel}>Thẻ</Text>

						{currentTags.length > 0 && (
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								style={styles.tagsScroll}
								contentContainerStyle={styles.tagsContent}>
								{currentTags.map((tag) => (
									<Badge
										key={tag}
										label={`#${tag}`}
										size="sm"
										onDismiss={() => removeTag(tag)}
									/>
								))}
							</ScrollView>
						)}

						<View style={styles.tagInputRow}>
							<TextInput
								style={[styles.tagInput, { color: colors.input.text, borderColor: colors.input.border }]}
								placeholder="Thêm thẻ..."
								placeholderTextColor={colors.input.placeholder}
								value={tagInput}
								onChangeText={setTagInput}
								onSubmitEditing={addTag}
								returnKeyType="done"
								maxLength={20}
								autoCapitalize="none"
							/>
							<Button
								title="Thêm"
								onPress={addTag}
								variant="outline"
								size="sm"
								disabled={tagInput.trim().length === 0 || currentTags.length >= 5}
							/>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</ScreenWrapper>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		flex: { flex: 1 },
		centered: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			gap: SPACING[12],
		},
		errorText: {
			fontSize: FONT_SIZE[14],
			color: colors.status.error,
			textAlign: "center",
			paddingHorizontal: SPACING[32],
		},
		backLink: { paddingVertical: SPACING[8] },
		backLinkText: {
			fontSize: FONT_SIZE[14],
			color: colors.text.link,
		},
		header: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingHorizontal: SPACING[16],
			paddingVertical: SPACING[12],
			borderBottomWidth: 1,
			borderBottomColor: colors.border.subtle,
		},
		scrollContent: {
			paddingHorizontal: SPACING[20],
			paddingTop: SPACING[12],
			paddingBottom: vs(40),
		},
		statusRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(4),
			marginBottom: SPACING[12],
			alignSelf: "flex-start",
		},
		statusDot: {
			width: s(6),
			height: vs(6),
			borderRadius: RADIUS.full,
		},
		statusText: {
			fontSize: FONT_SIZE[11],
			lineHeight: LINE_HEIGHT.tight,
		},
		titleInput: {
			fontSize: FONT_SIZE[18],
			fontWeight: "600",
			color: colors.text.primary,
			paddingVertical: SPACING[8],
			marginBottom: SPACING[8],
		},
		tagsSection: { marginTop: SPACING[8] },
		tagsLabel: {
			fontSize: FONT_SIZE[13],
			fontWeight: "500",
			color: colors.text.secondary,
			marginBottom: SPACING[8],
		},
		tagsScroll: { marginBottom: SPACING[8] },
		tagsContent: { gap: s(6) },
		tagInputRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(8),
		},
		tagInput: {
			flex: 1,
			borderWidth: 1,
			borderRadius: RADIUS.sm,
			paddingHorizontal: SPACING[12],
			paddingVertical: SPACING[8],
			fontSize: FONT_SIZE[13],
			backgroundColor: colors.input.background,
		},
	});
}
