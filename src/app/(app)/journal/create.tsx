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

import { Badge } from "@/components/ui/display/Badge";
import { Button } from "@/components/ui/buttons/Button";
import { RichTextEditor, SaveStatusBanner } from "@/components/journal";
import type { RichTextEditorRef } from "@/components/journal";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { useAutoSave, useForm, useThemeColors } from "@/hooks";
import { entryService } from "@/services";
import { createEntryFormSchema } from "@/schemas/entry.schemas";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, RADIUS, SPACING } from "@/theme";
import { s, vs, htmlToText } from "@/utils";
import type { QuillDelta } from "@/types/entry.types";

export default function CreateEntryScreen() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	// Tracks the server entry ID after first save — null = not yet created
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

		if (entryIdRef.current === null) {
			const result = await entryService.create({
				content: deltaRef.current,
				title: title.trim() || undefined,
				tags,
				entryDate: today,
				inputMethod: "TEXT",
			});
			if (!result.success) throw new Error(result.error ?? "Failed to create entry");
			entryIdRef.current = result.data.entry.id;
		} else {
			const result = await entryService.update(entryIdRef.current, {
				content: deltaRef.current,
				title: title.trim() || undefined,
				tags,
			});
			if (!result.success) throw new Error(result.error ?? "Failed to update entry");
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


	return (
		<ScreenWrapper padded={false}>
			{/* Header — outside KAV so keyboard doesn't push it up */}
			<View style={styles.header}>
				<Pressable onPress={handleBack} hitSlop={8} accessibilityRole="button" accessibilityLabel="Quay lại">
					<Ionicons name="chevron-back" size={s(24)} color={colors.text.primary} />
				</Pressable>
				<SaveStatusBanner status={saveStatus} />
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
