import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, Pressable, StyleSheet, View } from "react-native";
import type { AppStateStatus } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors, useThemeContext } from "@/hooks";
import { useNotificationStore } from "@/store";
import { notificationService } from "@/services/notification.service";
import type { ThemeColors } from "@/theme";
import { RADIUS, SPACING } from "@/theme";
import { s, vs } from "@/utils";
import { BAR_HEIGHT, FAB_SIZE } from "@/constants";
import { AddJournalMenu } from "./AddJournalMenu";
import { TabItem } from "./TabItem";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
	const colors = useThemeColors();
	const { colorScheme } = useThemeContext();
	const insets = useSafeAreaInsets();
	const styles = useMemo(() => createStyles(colors, insets.bottom), [colors, insets.bottom]);

	const { unreadCount, setUnreadCount } = useNotificationStore();
	const appState = useRef(AppState.currentState);

	const refreshUnreadCount = useCallback(() => {
		notificationService.getUnreadCount().then((res) => {
			if (res.success) setUnreadCount(res.data.count);
		});
	}, [setUnreadCount]);

	useEffect(() => {
		refreshUnreadCount();
	}, [refreshUnreadCount]);

	useEffect(() => {
		const sub = AppState.addEventListener("change", (nextState: AppStateStatus) => {
			if (appState.current !== "active" && nextState === "active") {
				refreshUnreadCount();
			}
			appState.current = nextState;
		});
		return () => sub.remove();
	}, [refreshUnreadCount]);

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
				unreadCount={route.name === "profile" ? unreadCount : 0}
			/>
		);
	}

	return (
		<>
			{/* Transparent full-screen dismiss layer — captures taps outside popup */}
			{menuOpen && (
				<Pressable
					style={StyleSheet.absoluteFillObject}
					onPress={handleMenuDismiss}
					accessible={false}
				/>
			)}

			{/* Floating tab bar wrapper — positions bar above safe area */}
			<View style={styles.wrapper} pointerEvents="box-none">
				{/* BlurView for liquid glass effect */}
				<BlurView intensity={60} tint={colorScheme === "dark" ? "dark" : "light"} style={styles.blurContainer}>
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

				{/* Popup menu — inline, positioned above the FAB */}
				<AddJournalMenu visible={menuOpen} onDismiss={handleMenuDismiss} />
			</View>
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
