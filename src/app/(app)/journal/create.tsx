// FR-06, FR-08: Create journal entry screen with auto-save

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
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

import { Button } from "@/components/ui/buttons/Button";
import { RichTextEditor, SaveStatusBanner } from "@/components/journal";
import type { RichTextEditorRef } from "@/components/journal";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { useAutoSave, useForm, useThemeColors } from "@/hooks";
import { entryService } from "@/services";
import { createEntryFormSchema } from "@/schemas/entry.schemas";
import { useMoodTagsStore } from "@/store";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, RADIUS, SPACING } from "@/theme";
import { s, vs, htmlToText } from "@/utils";
import type { QuillDelta } from "@/types/entry.types";

export default function CreateEntryScreen() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	// Tracks the server entry ID after first save — null = not yet created
	const entryIdRef = useRef<string | null>(null);
	const [contentDirty, setContentDirty] = useState(false);

	// Rich text editor state — managed outside react-hook-form
	const deltaRef = useRef<QuillDelta>({ ops: [{ insert: "\n" }] });
	const editorRef = useRef<RichTextEditorRef>(null);

	// Available tags from store (fetched once on app mount)
	const moodTags = useMoodTagsStore((s) => s.moodTags);
	const lifeTags = useMoodTagsStore((s) => s.lifeTags);

	const { watch, setValue, formState } = useForm({
		schema: createEntryFormSchema,
		defaultValues: { title: "", tagIds: [] },
		onSubmit: async () => {}, // auto-save only — no manual submit
	});

	const currentTagIds = watch("tagIds") ?? [];
	const titleValue = watch("title") ?? "";

	// ── Auto-save ────────────────────────────────────────────────────────────

	const saveFn = useCallback(async () => {
		const html = (await editorRef.current?.getContentHtml()) ?? "";
		if (htmlToText(html).length < 10) return;

		const title = watch("title") ?? "";
		const tagIds = watch("tagIds") ?? [];
		const today = new Date().toISOString().split("T")[0];

		if (entryIdRef.current === null) {
			const result = await entryService.create({
				content: deltaRef.current,
				title: title.trim() || undefined,
				tagIds,
				entryDate: today,
				inputMethod: "TEXT",
			});
			if (!result.success) throw new Error(result.error ?? "Failed to create entry");
			entryIdRef.current = result.data.entry.id;
		} else {
			const result = await entryService.update(entryIdRef.current, {
				content: deltaRef.current,
				title: title.trim() || undefined,
				tagIds,
			});
			if (!result.success) throw new Error(result.error ?? "Failed to update entry");
		}
	}, [watch]);

	const { saveStatus, triggerSave, triggerImmediately, isSaving } = useAutoSave({ saveFn });

	// ── Tag management (FR-08) ───────────────────────────────────────────────

	const toggleTag = useCallback(
		(id: string) => {
			const next = currentTagIds.includes(id)
				? currentTagIds.filter((t) => t !== id)
				: currentTagIds.length < 5
					? [...currentTagIds, id]
					: currentTagIds;
			setValue("tagIds", next, { shouldDirty: true });
			triggerSave();
		},
		[currentTagIds, setValue, triggerSave],
	);

	// ── Navigation ───────────────────────────────────────────────────────────

	const handleBack = useCallback(() => {
		const needsConfirm = (formState.isDirty || contentDirty) && saveStatus !== "saved";
		if (!needsConfirm) { router.back(); return; }
		Alert.alert(
			"Huỷ thay đổi?",
			"Nhật ký chưa được lưu. Bạn muốn làm gì?",
			[
				{ text: "Tiếp tục viết", style: "cancel" },
				{
					text: "Lưu và quay lại",
					onPress: () => {
						void (async () => {
							try { await triggerImmediately(); router.back(); } catch { /* stay; banner shows error */ }
						})();
					},
				},
				{ text: "Huỷ bỏ", style: "destructive", onPress: () => router.back() },
			],
		);
	}, [formState.isDirty, contentDirty, saveStatus, triggerImmediately]);


	return (
		<ScreenWrapper padded={false}>
			{/* Header — outside KAV so keyboard doesn't push it up */}
			<View style={styles.header}>
				<Pressable onPress={handleBack} hitSlop={8} disabled={isSaving} accessibilityRole="button" accessibilityLabel="Quay lại">
					<Ionicons name="chevron-back" size={s(24)} color={isSaving ? colors.interactive.disabled : colors.text.primary} />
				</Pressable>
				<SaveStatusBanner status={saveStatus} onSaveNow={() => void triggerImmediately()} />
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
														selected
															? { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }
															: { backgroundColor: colors.background.card, borderColor: colors.border.default },
														disabled && styles.tagChipDisabled,
													]}>
													<Text
														style={[
															styles.tagChipText,
															{ color: selected ? colors.text.inverse : colors.text.secondary },
															disabled && { color: colors.interactive.disabled },
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
														selected
															? { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }
															: { backgroundColor: colors.background.card, borderColor: colors.border.default },
														disabled && styles.tagChipDisabled,
													]}>
													<Text
														style={[
															styles.tagChipText,
															{ color: selected ? colors.text.inverse : colors.text.secondary },
															disabled && { color: colors.interactive.disabled },
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
		tagChipText: {
			fontSize: FONT_SIZE[13],
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
