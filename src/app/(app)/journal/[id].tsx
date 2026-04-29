// FR-06, FR-09: Journal entry detail and edit screen with auto-save

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	Alert,
	InteractionManager,
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

import type { RichTextEditorRef } from "@/components/journal";
import {
	EmotionAnalysisCard,
	EntryDetailSkeleton,
	MusicRecommendationSection,
	RichTextEditor,
	SaveStatusBanner,
} from "@/components/journal";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { Button } from "@/components/ui/buttons/Button";
import { ANALYSIS_STATUS_LABELS } from "@/constants/journal";
import { useAnalysisPolling, useAutoSave, useEntry, useForm, useThemeColors } from "@/hooks";
import { editEntryFormSchema } from "@/schemas/entry.schemas";
import { entryService } from "@/services";
import { useMoodTagsStore } from "@/store";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { QuillDelta } from "@/types/entry.types";
import { htmlToText, s, vs } from "@/utils";

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
		transform: [{ rotate: `${interpolate(expandProgress.value, [0, 1], [0, 180])}deg` }],
	}));

	const [contentDirty, setContentDirty] = useState(false);

	// Rich text editor state — managed outside react-hook-form
	const deltaRef = useRef<QuillDelta>({ ops: [{ insert: "\n" }] });
	const editorRef = useRef<RichTextEditorRef>(null);
	// Guards against resetting form state after every auto-save response
	const hasInitialized = useRef(false);

	// Available tags from store (fetched once on app mount)
	const moodTags = useMoodTagsStore((s) => s.moodTags);
	const lifeTags = useMoodTagsStore((s) => s.lifeTags);

	const { watch, setValue, reset, formState } = useForm({
		schema: editEntryFormSchema,
		defaultValues: { title: "", tagIds: [] },
		onSubmit: async () => {},
	});

	const currentTagIds = watch("tagIds") ?? [];
	const titleValue = watch("title") ?? "";

	// Populate form and deltaRef only on initial load — subsequent saves must not overwrite
	// pending user selections made while an API call was in-flight
	useEffect(() => {
		if (!entry || hasInitialized.current) return;
		hasInitialized.current = true;
		reset({
			title: entry.title ?? "",
			tagIds: [...(entry.moodTags ?? []), ...(entry.lifeTags ?? [])].map((t) => t.id),
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
		const tagIds = watch("tagIds") ?? [];

		await updateEntry({
			content: deltaRef.current,
			title: title.trim() || undefined,
			tagIds,
		});
	}, [watch, updateEntry]);

	const { saveStatus, triggerSave, triggerImmediately, isSaving } = useAutoSave({ saveFn });

	// ── Tag management (FR-08) ───────────────────────────────────────────────

	const toggleTag = useCallback(
		(tagId: string) => {
			const next = currentTagIds.includes(tagId)
				? currentTagIds.filter((t) => t !== tagId)
				: currentTagIds.length < 5
					? [...currentTagIds, tagId]
					: currentTagIds;
			setValue("tagIds", next, { shouldDirty: true });
			triggerSave();
		},
		[currentTagIds, setValue, triggerSave],
	);

	// ── Delete (FR-09) ───────────────────────────────────────────────────────

	const handleDelete = useCallback(() => {
		Alert.alert("Xoá nhật ký", "Bạn có chắc muốn xoá nhật ký này? Thao tác không thể hoàn tác.", [
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
		]);
	}, [deleteEntry]);

	// ── Navigation ───────────────────────────────────────────────────────────

	const handleBack = useCallback(() => {
		const needsConfirm = (formState.isDirty || contentDirty) && saveStatus !== "saved";
		if (!needsConfirm) {
			router.back();
			return;
		}
		Alert.alert("Huỷ thay đổi?", "Nhật ký chưa được lưu. Bạn muốn làm gì?", [
			{ text: "Tiếp tục viết", style: "cancel" },
			{
				text: "Lưu và quay lại",
				onPress: () => {
					void (async () => {
						try {
							await triggerImmediately();
							router.back();
						} catch {
							/* stay; banner shows error */
						}
					})();
				},
			},
			{ text: "Huỷ bỏ", style: "destructive", onPress: () => router.back() },
		]);
	}, [formState.isDirty, contentDirty, saveStatus, triggerImmediately]);

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

	const statusColor = useMemo(() => {
		if (!currentEntry) return colors.text.muted;
		return (
			({
				PENDING: colors.text.muted,
				PROCESSING: colors.status.info,
				COMPLETED: colors.status.success,
				FAILED: colors.status.error,
			} as Record<string, string>)[currentEntry.analysisStatus] ?? colors.text.muted
		);
	}, [currentEntry?.analysisStatus, colors]);

	// Defer WebView mount until the navigation transition is complete
	const [editorReady, setEditorReady] = useState(false);
	useEffect(() => {
		const task = InteractionManager.runAfterInteractions(() => setEditorReady(true));
		return () => task.cancel();
	}, []);

	// ── Loading / error states ────────────────────────────────────────────────

	if (isLoading || (!currentEntry && !error)) {
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

	return (
		<ScreenWrapper padded={false}>
			{/* Header */}
			<View style={styles.header}>
				<Pressable
					onPress={handleBack}
					hitSlop={8}
					disabled={isSaving}
					accessibilityRole="button"
					accessibilityLabel="Quay lại">
					<Ionicons
						name="chevron-back"
						size={s(24)}
						color={isSaving ? colors.interactive.disabled : colors.text.primary}
					/>
				</Pressable>
				<SaveStatusBanner status={saveStatus} onSaveNow={() => void triggerImmediately()} />
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

					{/* Content — rich text editor (FR-06) — deferred until nav transition settles */}
					{editorReady ? (
						<RichTextEditor
							ref={editorRef}
							initialDelta={currentEntry.content}
							placeholder="Nội dung nhật ký..."
							minHeight={vs(300)}
							onChange={(delta) => {
								deltaRef.current = delta;
								setContentDirty(true);
								triggerSave();
							}}
							onBlur={() => void triggerImmediately()}
						/>
					) : (
						<View style={[styles.editorPlaceholder, { minHeight: vs(300) }]} />
					)}

					{/* Tags (FR-08) — chip picker grouped by MOOD / LIFE */}
					{(moodTags.length > 0 || lifeTags.length > 0) && (
						<View style={styles.tagsSection}>
							<Text style={styles.tagsLabel}>
								Thẻ{currentTagIds.length > 0 ? ` (${currentTagIds.length}/5)` : ""}
							</Text>
							{moodTags.length > 0 && (
								<>
									<Text style={styles.tagGroupLabel}>Cảm xúc</Text>
									<View style={styles.tagsGrid}>
										{moodTags.map((tag) => {
											const selected = currentTagIds.includes(tag.id);
											const disabled = !selected && currentTagIds.length >= 5;
											return (
												<Pressable
													key={tag.id}
													onPress={() => toggleTag(tag.id)}
													disabled={disabled}
													accessibilityRole="button"
													accessibilityLabel={`${selected ? "Bỏ chọn" : "Chọn"} thẻ ${tag.name}`}
													style={[
														styles.tagChip,
														selected ? styles.tagChipSelected : styles.tagChipUnselected,
														disabled && styles.tagChipDisabled,
													]}>
													<Text
														style={[
															styles.tagChipText,
															selected ? styles.tagChipTextSelected : styles.tagChipTextUnselected,
															disabled && styles.tagChipTextDisabled,
														]}>
														#{tag.name}
													</Text>
												</Pressable>
											);
										})}
									</View>
								</>
							)}
							{lifeTags.length > 0 && (
								<>
									<Text style={styles.tagGroupLabel}>Cuộc sống</Text>
									<View style={styles.tagsGrid}>
										{lifeTags.map((tag) => {
											const selected = currentTagIds.includes(tag.id);
											const disabled = !selected && currentTagIds.length >= 5;
											return (
												<Pressable
													key={tag.id}
													onPress={() => toggleTag(tag.id)}
													disabled={disabled}
													accessibilityRole="button"
													accessibilityLabel={`${selected ? "Bỏ chọn" : "Chọn"} thẻ ${tag.name}`}
													style={[
														styles.tagChip,
														selected ? styles.tagChipSelected : styles.tagChipUnselected,
														disabled && styles.tagChipDisabled,
													]}>
													<Text
														style={[
															styles.tagChipText,
															selected ? styles.tagChipTextSelected : styles.tagChipTextUnselected,
															disabled && styles.tagChipTextDisabled,
														]}>
														#{tag.name}
													</Text>
												</Pressable>
											);
										})}
									</View>
								</>
							)}
						</View>
					)}

					{/* Music recommendation (FR-11) */}
					{currentEntry.analysisStatus === "COMPLETED" && (
						<MusicRecommendationSection
							entryId={currentEntry.id}
							musicStatus={currentEntry.musicStatus}
						/>
					)}
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
		editorPlaceholder: {
			borderWidth: 1,
			borderColor: colors.input.border,
			borderRadius: RADIUS.sm,
			backgroundColor: colors.input.background,
		},
		tagsSection: { marginTop: SPACING[8] },
		tagsLabel: {
			fontSize: FONT_SIZE[13],
			fontWeight: "500",
			color: colors.text.secondary,
			marginBottom: SPACING[8],
		},
		tagsGrid: {
			flexDirection: "row",
			flexWrap: "wrap",
			gap: s(8),
		},
		tagChip: {
			borderWidth: 1,
			borderRadius: RADIUS.full,
			paddingHorizontal: SPACING[12],
			paddingVertical: SPACING[6],
		},
		tagChipDisabled: {
			opacity: 0.4,
		},
		tagChipSelected: {
			backgroundColor: colors.brand.primary,
			borderColor: colors.brand.primary,
		},
		tagChipUnselected: {
			backgroundColor: colors.background.card,
			borderColor: colors.border.default,
		},
		tagChipText: {
			fontSize: FONT_SIZE[13],
		},
		tagChipTextSelected: {
			color: colors.text.inverse,
		},
		tagChipTextUnselected: {
			color: colors.text.secondary,
		},
		tagChipTextDisabled: {
			color: colors.interactive.disabled,
		},
		tagGroupLabel: {
			fontSize: FONT_SIZE[12],
			fontWeight: "500",
			color: colors.text.muted,
			marginTop: SPACING[8],
			marginBottom: SPACING[4],
		},
	});
}
