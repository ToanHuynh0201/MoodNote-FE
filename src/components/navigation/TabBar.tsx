import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { useThemeColors } from "@/hooks";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { ThemeColors } from "@/theme";
import { s, vs } from "@/utils";
import { AddJournalMenu } from "./AddJournalMenu";

const FAB_SIZE = s(58);
const BAR_HEIGHT = vs(64);

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface TabIconConfig {
	active: IoniconName;
	inactive: IoniconName;
}

const TAB_ICONS: Record<string, TabIconConfig> = {
	index: { active: "home", inactive: "home-outline" },
	journal: { active: "book", inactive: "book-outline" },
	statistics: { active: "bar-chart", inactive: "bar-chart-outline" },
	profile: { active: "person", inactive: "person-outline" },
};

interface TabItemProps {
	label: string;
	routeName: string;
	isFocused: boolean;
	onPress: () => void;
	onLongPress: () => void;
	colors: ThemeColors;
}

function TabItem({ label, routeName, isFocused, onPress, onLongPress, colors }: TabItemProps) {
	const iconConfig = TAB_ICONS[routeName] ?? { active: "ellipse", inactive: "ellipse-outline" };
	const iconName: IoniconName = isFocused ? iconConfig.active : iconConfig.inactive;
	const iconColor = isFocused ? colors.nav.activeIcon : colors.nav.inactiveIcon;
	const labelColor = isFocused ? colors.nav.activeTint : colors.nav.inactiveTint;

	const itemStyles = useMemo(() => createItemStyles(colors), [colors]);

	return (
		<Pressable
			style={itemStyles.container}
			onPress={onPress}
			onLongPress={onLongPress}
			accessibilityRole="tab"
			accessibilityLabel={label}
			accessibilityState={{ selected: isFocused }}
			hitSlop={8}>
			<Ionicons name={iconName} size={s(22)} color={iconColor} />
			<Text style={[itemStyles.label, { color: labelColor }]}>{label}</Text>
		</Pressable>
	);
}

function createItemStyles(colors: ThemeColors) {
	return StyleSheet.create({
		container: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
			paddingVertical: SPACING[8],
			gap: SPACING[4],
		},
		label: {
			fontSize: FONT_SIZE[11],
			lineHeight: LINE_HEIGHT.tight,
		},
	});
}

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();
	const styles = useMemo(() => createStyles(colors, insets.bottom), [colors, insets.bottom]);

	const [menuOpen, setMenuOpen] = useState(false);

	// Reanimated cross-fade: 0 = "+" visible, 1 = "≡" visible
	const progress = useSharedValue(0);

	const addIconStyle = useAnimatedStyle(() => ({
		opacity: 1 - progress.value,
		transform: [{ scale: 1 - progress.value * 0.15 }],
	}));

	const menuIconStyle = useAnimatedStyle(() => ({
		opacity: progress.value,
		transform: [{ scale: 0.85 + progress.value * 0.15 }],
	}));

	const handleFabPress = useCallback(() => {
		const opening = !menuOpen;
		progress.value = withTiming(opening ? 1 : 0, { duration: 250 });
		setMenuOpen(opening);
	}, [menuOpen, progress]);

	const handleMenuDismiss = useCallback(() => {
		progress.value = withTiming(0, { duration: 250 });
		setMenuOpen(false);
	}, [progress]);

	const leftTabs = state.routes.slice(0, 2);
	const rightTabs = state.routes.slice(2, 4);

	function renderTab(route: (typeof state.routes)[number], index: number, offset: number) {
		const descriptor = descriptors[route.key];
		const isFocused = state.index === index + offset;
		const label = descriptor?.options?.title ?? route.name;

		const onPress = () => {
			const event = navigation.emit({
				type: "tabPress",
				target: route.key,
				canPreventDefault: true,
			});
			if (!isFocused && !event.defaultPrevented) {
				navigation.navigate(route.name);
			}
		};

		const onLongPress = () => {
			navigation.emit({ type: "tabLongPress", target: route.key });
		};

		return (
			<TabItem
				key={route.key}
				label={label}
				routeName={route.name}
				isFocused={isFocused}
				onPress={onPress}
				onLongPress={onLongPress}
				colors={colors}
			/>
		);
	}

	return (
		<>
			{/* Floating tab bar wrapper — positions bar above safe area */}
			<View style={styles.wrapper} pointerEvents="box-none">
				{/* BlurView for liquid glass effect */}
				<BlurView intensity={50} tint="dark" style={styles.blurContainer}>
					{/* Semi-transparent overlay for glass tint */}
					<View style={styles.overlay}>
						{/* Left tabs */}
						{leftTabs.map((route, i) => renderTab(route, i, 0))}

						{/* Center spacer (for FAB) */}
						<View style={styles.fabSpacer} />

						{/* Right tabs */}
						{rightTabs.map((route, i) => renderTab(route, i, 2))}
					</View>
				</BlurView>

				{/* FAB button — absolutely positioned above the bar */}
				<Pressable
					style={styles.fab}
					onPress={handleFabPress}
					accessibilityLabel={menuOpen ? "Đóng menu" : "Thêm nhật ký"}
					accessibilityRole="button"
					hitSlop={8}>
					{/* "+" icon */}
					<Animated.View style={[StyleSheet.absoluteFill, styles.fabIconCenter, addIconStyle]}>
						<Ionicons name="add" size={s(28)} color={colors.text.inverse} />
					</Animated.View>
					{/* "≡" icon */}
					<Animated.View style={[StyleSheet.absoluteFill, styles.fabIconCenter, menuIconStyle]}>
						<Ionicons name="reorder-three" size={s(28)} color={colors.text.inverse} />
					</Animated.View>
				</Pressable>
			</View>

			<AddJournalMenu visible={menuOpen} onDismiss={handleMenuDismiss} />
		</>
	);
}

function createStyles(colors: ThemeColors, bottomInset: number) {
	return StyleSheet.create({
		wrapper: {
			position: "absolute",
			bottom: vs(12) + bottomInset,
			left: SPACING[16],
			right: SPACING[16],
			alignItems: "center",
		},
		blurContainer: {
			width: "100%",
			borderRadius: RADIUS.xl,
			overflow: "hidden",
			// Shadow / elevation for floating effect
			shadowColor: colors.shadow,
			shadowOffset: { width: 0, height: vs(8) },
			shadowOpacity: 0.4,
			shadowRadius: s(16),
			elevation: 12,
		},
		overlay: {
			flexDirection: "row",
			alignItems: "center",
			height: BAR_HEIGHT,
			backgroundColor: colors.nav.backgroundGlass,
			paddingHorizontal: SPACING[8],
		},
		fabSpacer: {
			width: FAB_SIZE + SPACING[8],
		},
		fab: {
			position: "absolute",
			top: -(FAB_SIZE / 2 + vs(8)),
			width: FAB_SIZE,
			height: FAB_SIZE,
			borderRadius: RADIUS.full,
			backgroundColor: colors.brand.primary,
			// Shadow
			shadowColor: colors.brand.primary,
			shadowOffset: { width: 0, height: vs(4) },
			shadowOpacity: 0.5,
			shadowRadius: s(12),
			elevation: 10,
		},
		fabIconCenter: {
			alignItems: "center",
			justifyContent: "center",
		},
	});
}
