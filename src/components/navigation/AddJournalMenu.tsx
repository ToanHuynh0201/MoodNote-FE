import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

import { useThemeColors } from "@/hooks";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { ThemeColors } from "@/theme";
import { s, vs } from "@/utils";

const PANEL_HEIGHT = vs(200);

interface AddJournalMenuProps {
	visible: boolean;
	onDismiss: () => void;
}

interface MenuOptionProps {
	icon: ReactNode;
	label: string;
	onPress: () => void;
	colors: ThemeColors;
}

function MenuOption({ icon, label, onPress, colors }: MenuOptionProps) {
	const styles = useMemo(() => createOptionStyles(colors), [colors]);
	return (
		<Pressable
			style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={label}>
			<View style={styles.iconWrap}>{icon}</View>
			<Text style={styles.label}>{label}</Text>
		</Pressable>
	);
}

function createOptionStyles(colors: ThemeColors) {
	return StyleSheet.create({
		option: {
			flexDirection: "row",
			alignItems: "center",
			gap: SPACING[12],
			paddingVertical: SPACING[14],
			paddingHorizontal: SPACING[20],
		},
		optionPressed: {
			backgroundColor: colors.background.elevated,
		},
		iconWrap: {
			width: s(40),
			height: s(40),
			borderRadius: RADIUS.md,
			backgroundColor: colors.brand.surface,
			alignItems: "center",
			justifyContent: "center",
		},
		label: {
			fontSize: FONT_SIZE[15],
			lineHeight: LINE_HEIGHT.normal,
			color: colors.text.primary,
			fontWeight: "500",
		},
	});
}

export function AddJournalMenu({ visible, onDismiss }: AddJournalMenuProps) {
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();
	const styles = useMemo(() => createStyles(colors, insets.bottom), [colors, insets.bottom]);

	const translateY = useSharedValue(PANEL_HEIGHT);
	const backdropOpacity = useSharedValue(0);

	useEffect(() => {
		const timing = { duration: 300, easing: Easing.out(Easing.cubic) };
		if (visible) {
			backdropOpacity.value = withTiming(1, { duration: 250 });
			translateY.value = withTiming(0, timing);
		} else {
			backdropOpacity.value = withTiming(0, { duration: 200 });
			translateY.value = withTiming(PANEL_HEIGHT, timing);
		}
	}, [visible, translateY, backdropOpacity]);

	const backdropStyle = useAnimatedStyle(() => ({
		opacity: backdropOpacity.value,
	}));

	const panelStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	return (
		<Modal
			visible={visible}
			transparent
			statusBarTranslucent
			animationType="none"
			onRequestClose={onDismiss}>
			<View style={styles.root} pointerEvents="box-none">
				{/* Backdrop */}
				<Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="auto">
					<Pressable style={StyleSheet.absoluteFillObject} onPress={onDismiss} />
				</Animated.View>

				{/* Sliding panel */}
				<Animated.View style={[styles.panel, panelStyle]}>
					<View style={styles.handle} />
					<MenuOption
						icon={
							<Ionicons
								name="create-outline"
								size={s(22)}
								color={colors.brand.primary}
							/>
						}
						label="Viết nhật ký"
						onPress={onDismiss}
						colors={colors}
					/>
					<View style={styles.divider} />
					<MenuOption
						icon={
							<Ionicons
								name="mic-outline"
								size={s(22)}
								color={colors.brand.primary}
							/>
						}
						label="Nhật ký bằng giọng nói"
						onPress={onDismiss}
						colors={colors}
					/>
				</Animated.View>
			</View>
		</Modal>
	);
}

function createStyles(colors: ThemeColors, bottomInset: number) {
	return StyleSheet.create({
		root: {
			flex: 1,
			justifyContent: "flex-end",
		},
		backdrop: {
			...StyleSheet.absoluteFillObject,
			backgroundColor: colors.background.overlay,
		},
		panel: {
			backgroundColor: colors.background.elevated,
			borderTopLeftRadius: RADIUS.xl,
			borderTopRightRadius: RADIUS.xl,
			paddingBottom: bottomInset + SPACING[8],
			// Shadow
			shadowColor: colors.shadow,
			shadowOffset: { width: 0, height: -vs(4) },
			shadowOpacity: 0.2,
			shadowRadius: s(12),
			elevation: 16,
		},
		handle: {
			width: s(40),
			height: vs(4),
			borderRadius: RADIUS.full,
			backgroundColor: colors.border.subtle,
			alignSelf: "center",
			marginTop: SPACING[12],
			marginBottom: SPACING[4],
		},
		divider: {
			height: 1,
			backgroundColor: colors.divider,
			marginHorizontal: SPACING[20],
		},
	});
}
