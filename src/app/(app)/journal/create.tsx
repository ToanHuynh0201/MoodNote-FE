// FR-06, FR-08: Create journal entry screen with auto-save

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
import Animated, { FadeIn } from "react-native-reanimated";

import { Badge } from "@/components/ui/display/Badge";
import { Button } from "@/components/ui/buttons/Button";
import { RichTextEditor } from "@/components/journal";
import type { RichTextEditorRef } from "@/components/journal";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import {
	insertEntry,
	markSynced,
	markUpdateSynced,
	updateEntry as dbUpdateEntry,
	getEntryServerId,
} from "@/db";
import { useAutoSave, useForm, useSync, useThemeColors } from "@/hooks";
import { entryService } from "@/services";
import { logError } from "@/utils/error";
import { createEntryFormSchema } from "@/schemas/entry.schemas";
import { randomUUID } from "expo-crypto";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import { s, vs, htmlToText } from "@/utils";
import type { QuillDelta } from "@/types/entry.types";

export default function CreateEntryScreen() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { isOnline } = useSync();
	const isOnlineRef = useRef(isOnline);
	useEffect(() => {
		isOnlineRef.current = isOnline;
	}, [isOnline]);

	// Tracks the local entry ID after first save — null = not yet created
	const entryIdRef = useRef<string | null>(null);
	const [tagInput, setTagInput] = useState("");
	const [contentDirty, setContentDirty] = useState(false);

	// Rich text editor state — managed outside react-hook-form
	const deltaRef = useRef<QuillDelta>({ ops: [{ insert: "\n" }] });
	const editorRef = useRef<RichTextEditorRef>(null);

	const { watch, setValue, formState } = useForm({
		schema: createEntryFormSchema,
		defaultValues: { title: "", tags: [] },
		onSubmit: async () => {}, // auto-save only — no manual submit
	});

	const currentTags = watch("tags") ?? [];
	const titleValue = watch("title") ?? "";

	// ── Auto-save ────────────────────────────────────────────────────────────

	const saveFn = useCallback(async () => {
		const html = (await editorRef.current?.getContentHtml()) ?? "";
		if (htmlToText(html).length < 10) return;

		const title = watch("title") ?? "";
		const tags = watch("tags") ?? [];
		const today = new Date().toISOString().split("T")[0];
		const now = new Date().toISOString();

		const text = deltaRef.current.ops
			.map((op) => (typeof op.insert === "string" ? op.insert : ""))
			.join("")
			.trim();
		const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

		if (entryIdRef.current === null) {
			// First save — write to local DB immediately (NFR-04)
			const localId = randomUUID();
			await insertEntry({
				local_id: localId,
				title: title.trim() || undefined,
				content: JSON.stringify(deltaRef.current),
				entry_date: today,
				input_method: "TEXT",
				tags: JSON.stringify(tags),
				word_count: wordCount,
				is_private: 0,
				analysis_status: "PENDING",
				sync_status: "pending_create",
				created_at: now,
				updated_at: now,
			});
			entryIdRef.current = localId;

			// Background server create if online
			if (isOnlineRef.current) {
				const result = await entryService.create({
					content: deltaRef.current,
					title: title.trim() || undefined,
					tags,
					entryDate: today,
					inputMethod: "TEXT",
				});
				if (!result.success) {
					logError(result.error, { context: "create.tsx saveFn server create" });
				} else {
					await markSynced(
						localId,
						result.data.entry.id,
						result.data.entry.analysisStatus,
					);
				}
			}
		} else {
			// Subsequent save — update local DB immediately
			await dbUpdateEntry(entryIdRef.current, {
				title: title.trim() || null,
				content: JSON.stringify(deltaRef.current),
				tags: JSON.stringify(tags),
				word_count: wordCount,
				updated_at: now,
			});

			// Background server update if online
			if (isOnlineRef.current) {
				const serverId = await getEntryServerId(entryIdRef.current);
				if (serverId) {
					const currentId = entryIdRef.current;
					entryService
						.update(serverId, {
							content: deltaRef.current,
							title: title.trim() || undefined,
							tags,
						})
						.then((result) => {
							if (result.success) return markUpdateSynced(currentId);
							logError(result.error, { context: "create.tsx saveFn server update" });
						});
				}
			}
		}
	}, [watch]);

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

	// ── Navigation ───────────────────────────────────────────────────────────

	const handleBack = useCallback(() => {
		if ((formState.isDirty || contentDirty) && saveStatus !== "saved" && entryIdRef.current !== null) {
			Alert.alert(
				"Huỷ thay đổi?",
				"Nhật ký chưa được lưu. Bạn có muốn huỷ bỏ?",
				[
					{ text: "Tiếp tục viết", style: "cancel" },
					{
						text: "Huỷ bỏ",
						style: "destructive",
						onPress: () => router.back(),
					},
				],
			);
		} else {
			router.back();
		}
	}, [formState.isDirty, contentDirty, saveStatus]);

	// ── Save status indicator (animated fade between states) ─────────────────

	const SaveIndicator = useMemo(() => {
		if (saveStatus === "saving") {
			return (
				<Animated.View
					key="saving"
					entering={FadeIn.duration(200)}
					style={styles.saveIndicator}>
					<ActivityIndicator size="small" color={colors.text.muted} />
					<Text style={styles.saveText}>Đang lưu...</Text>
				</Animated.View>
			);
		}
		if (saveStatus === "saved") {
			return (
				<Animated.View
					key="saved"
					entering={FadeIn.duration(200)}
					style={styles.saveIndicator}>
					<Ionicons name="checkmark-circle" size={s(16)} color={colors.status.success} />
					<Text style={[styles.saveText, { color: colors.status.success }]}>Đã lưu</Text>
				</Animated.View>
			);
		}
		if (saveStatus === "error") {
			return (
				<Animated.View
					key="error"
					entering={FadeIn.duration(200)}
					style={styles.saveIndicator}>
					<Ionicons name="alert-circle" size={s(16)} color={colors.status.error} />
					<Text style={[styles.saveText, { color: colors.status.error }]}>Lỗi lưu</Text>
				</Animated.View>
			);
		}
		return null;
	}, [saveStatus, colors, styles]);

	return (
		<ScreenWrapper padded={false}>
			{/* Header — outside KAV so keyboard doesn't push it up */}
			<View style={styles.header}>
				<Pressable onPress={handleBack} hitSlop={8} accessibilityRole="button" accessibilityLabel="Quay lại">
					<Ionicons name="chevron-back" size={s(24)} color={colors.text.primary} />
				</Pressable>
				{SaveIndicator}
				<View style={styles.headerSpacer} />
			</View>

			<KeyboardAvoidingView
				style={styles.flex}
				behavior={Platform.OS === "ios" ? "padding" : "height"}>
				<ScrollView
					style={styles.flex}
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}>

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
						placeholder="Hôm nay bạn cảm thấy thế nào?"
						minHeight={vs(300)}
						onChange={(delta) => {
							deltaRef.current = delta;
							setContentDirty(true);
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
		header: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingHorizontal: SPACING[16],
			paddingVertical: SPACING[12],
			borderBottomWidth: 1,
			borderBottomColor: colors.border.subtle,
		},
		headerSpacer: { width: s(24) },
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
		titleInput: {
			fontSize: FONT_SIZE[18],
			fontWeight: "600",
			color: colors.text.primary,
			paddingVertical: SPACING[8],
			marginBottom: SPACING[8],
		},
		tagsSection: {
			marginTop: SPACING[8],
		},
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
