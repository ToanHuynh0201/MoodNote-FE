import { useCallback, useMemo } from "react";
import {
	KeyboardAvoidingView,
	Modal as RNModal,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import type { ModalProps } from "@/types";
import { IconButton } from "../buttons/IconButton";
import { Ionicons } from "@expo/vector-icons";

export function Modal({
	visible,
	onDismiss,
	children,
	title,
	dismissible = true,
}: ModalProps) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const handleBackdropPress = useCallback(() => {
		if (dismissible) onDismiss();
	}, [dismissible, onDismiss]);

	return (
		<RNModal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onDismiss}
			statusBarTranslucent>
			<KeyboardAvoidingView
				style={styles.overlay}
				behavior={Platform.OS === "ios" ? "padding" : "height"}>
				<Pressable style={styles.backdrop} onPress={handleBackdropPress} />
				<View style={styles.container}>
					{title != null && (
						<View style={styles.header}>
							<Text style={styles.title}>{title}</Text>
							<IconButton
								icon={<Ionicons name="close" size={22} color={colors.text.secondary} />}
								onPress={onDismiss}
								accessibilityLabel="Đóng"
								size="sm"
							/>
						</View>
					)}
					{children}
				</View>
			</KeyboardAvoidingView>
		</RNModal>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		overlay: {
			flex: 1,
			justifyContent: "flex-end",
		},
		backdrop: {
			...StyleSheet.absoluteFillObject,
			backgroundColor: colors.background.overlay,
		},
		container: {
			backgroundColor: colors.background.elevated,
			borderTopLeftRadius: 20,
			borderTopRightRadius: 20,
			paddingBottom: 32,
			paddingHorizontal: 20,
			paddingTop: 8,
			maxHeight: "90%",
		},
		header: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingVertical: 12,
			marginBottom: 4,
		},
		title: {
			fontSize: 17,
			fontWeight: "600",
			color: colors.text.primary,
		},
	});
}
