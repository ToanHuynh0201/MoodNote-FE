// FR-06, FR-09: Journal entry detail and edit screen with auto-save

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
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

import { Badge } from "@/components/ui/display/Badge";
import { Button } from "@/components/ui/buttons/Button";
import { RichTextEditor } from "@/components/journal";
import type { RichTextEditorRef } from "@/components/journal";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { useAutoSave, useEntry, useForm, useThemeColors } from "@/hooks";
import { editEntryFormSchema } from "@/schemas/entry.schemas";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import { htmlToText, s, vs } from "@/utils";
import type { QuillDelta } from "@/types/entry.types";

const ANALYSIS_STATUS_LABELS: Record<string, string> = {
	PENDING: "Chờ phân tích",
	PROCESSING: "Đang phân tích",
	COMPLETED: "Đã phân tích",
	FAILED: "Phân tích lỗi",
};

export default function EntryDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const { entry, isLoading, error, updateEntry, deleteEntry } = useEntry(id);
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

	// Populate form and deltaRef when entry loads
	useEffect(() => {
		if (!entry) return;
		reset({
			title: entry.title ?? "",
			tags: entry.tags,
		});
		deltaRef.current = entry.content;
	}, [entry, reset]);

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

	// ── Save status indicator ─────────────────────────────────────────────────

	const SaveIndicator = useMemo(() => {
		if (saveStatus === "saving") {
			return (
				<View style={styles.saveIndicator}>
					<ActivityIndicator size="small" color={colors.text.muted} />
					<Text style={styles.saveText}>Đang lưu...</Text>
				</View>
			);
		}
		if (saveStatus === "saved") {
			return (
				<View style={styles.saveIndicator}>
					<Ionicons name="checkmark-circle" size={s(16)} color={colors.status.success} />
					<Text style={[styles.saveText, { color: colors.status.success }]}>Đã lưu</Text>
				</View>
			);
		}
		if (saveStatus === "error") {
			return (
				<View style={styles.saveIndicator}>
					<Ionicons name="alert-circle" size={s(16)} color={colors.status.error} />
					<Text style={[styles.saveText, { color: colors.status.error }]}>Lỗi lưu</Text>
				</View>
			);
		}
		return null;
	}, [saveStatus, colors, styles]);

	// ── Loading / error states ────────────────────────────────────────────────

	if (isLoading) {
		return (
			<ScreenWrapper padded={false} style={styles.centered}>
				<ActivityIndicator size="large" color={colors.brand.primary} />
			</ScreenWrapper>
		);
	}

	if (error || !entry) {
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
	}[entry.analysisStatus] ?? colors.text.muted;

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
				{SaveIndicator}
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

					{/* Analysis status */}
					<View style={styles.statusRow}>
						<View style={[styles.statusDot, { backgroundColor: statusColor }]} />
						<Text style={[styles.statusText, { color: statusColor }]}>
							{ANALYSIS_STATUS_LABELS[entry.analysisStatus] ?? entry.analysisStatus}
						</Text>
					</View>

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
						initialDelta={entry.content}
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
		saveIndicator: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(4),
		},
		saveText: {
			fontSize: FONT_SIZE[12],
			color: colors.text.muted,
			lineHeight: LINE_HEIGHT.tight,
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
