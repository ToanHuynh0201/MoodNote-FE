import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import type { ConfirmationDialogProps } from "@/types";
import { Button } from "../buttons/Button";
import { Modal } from "./Modal";

export function ConfirmationDialog({
	visible,
	title,
	message,
	confirmLabel = "Xác nhận",
	cancelLabel = "Huỷ",
	confirmVariant = "primary",
	onConfirm,
	onCancel,
}: ConfirmationDialogProps) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<Modal visible={visible} onDismiss={onCancel} dismissible={false}>
			<View style={styles.body}>
				<Text style={styles.title}>{title}</Text>
				<Text style={styles.message}>{message}</Text>
				<View style={styles.actions}>
					<View style={styles.actionButton}>
						<Button
							title={cancelLabel}
							onPress={onCancel}
							variant="outline"
							fullWidth
						/>
					</View>
					<View style={styles.actionButton}>
						<Button
							title={confirmLabel}
							onPress={onConfirm}
							variant={confirmVariant}
							fullWidth
						/>
					</View>
				</View>
			</View>
		</Modal>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		body: { paddingTop: 8, paddingBottom: 8 },
		title: {
			fontSize: 18,
			fontWeight: "700",
			color: colors.text.primary,
			marginBottom: 10,
		},
		message: {
			fontSize: 15,
			color: colors.text.secondary,
			lineHeight: 22,
			marginBottom: 24,
		},
		actions: {
			flexDirection: "row",
			gap: 12,
		},
		actionButton: { flex: 1 },
	});
}
