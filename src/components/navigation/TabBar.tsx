import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppStateStatus } from "react-native";
import { AppState, Pressable, StyleSheet, View } from "react-native";
import Animated, {
	cancelAnimation,
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BAR_HEIGHT, FAB_SIZE } from "@/constants";
import { usePlayer, useThemeColors, useThemeContext } from "@/hooks";
import { notificationService } from "@/services/notification.service";
import { useNotificationStore } from "@/store";
import type { ThemeColors } from "@/theme";
import { RADIUS, SPACING } from "@/theme";
import { s, vs } from "@/utils";
import { MusicPlayerPanel } from "./MusicPlayerPanel";
import { TabItem } from "./TabItem";

const BORDER_W = 3;

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

	const { isPlaying } = usePlayer();

	const [menuOpen, setMenuOpen] = useState(false);

	// Cross-fade between "+" and "≡" icons
	const progress = useSharedValue(0);

	const addIconStyle = useAnimatedStyle(() => ({
		opacity: 1 - progress.value,
		transform: [{ scale: 1 - progress.value * 0.15 }],
	}));

	const menuIconStyle = useAnimatedStyle(() => ({
		opacity: progress.value,
		transform: [{ scale: 0.85 + progress.value * 0.15 }],
	}));

	// Spinning border when music is playing
	const rotation = useSharedValue(0);

	useEffect(() => {
		if (isPlaying) {
			rotation.value = withRepeat(
				withTiming(360, { duration: 2000, easing: Easing.linear }),
				-1,
				false,
			);
		} else {
			cancelAnimation(rotation);
			rotation.value = 0;
		}
	}, [isPlaying, rotation]);

	const spinStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotation.value}deg` }],
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
				unreadCount={route.name === "profile" ? unreadCount : 0}
			/>
		);
	}

	return (
		<>
			{menuOpen && (
				<Pressable
					style={StyleSheet.absoluteFillObject}
					onPress={handleMenuDismiss}
					accessible={false}
				/>
			)}

			<View style={styles.wrapper} pointerEvents="box-none">
				<BlurView
					intensity={60}
					tint={colorScheme === "dark" ? "dark" : "light"}
					style={styles.blurContainer}>
					<View style={styles.overlay}>
						{leftTabs.map((route, i) => renderTab(route, i, 0))}
						<View style={styles.fabSpacer} />
						{rightTabs.map((route, i) => renderTab(route, i, 2))}
					</View>
				</BlurView>

				{/* FAB group — spinning gradient ring + inner button */}
				<View style={styles.fabGroup}>
					{isPlaying && (
						<Animated.View style={[StyleSheet.absoluteFill, spinStyle]}>
							<LinearGradient
								colors={[
									colors.brand.primary,
									colors.brand.highlight,
									colors.brand.secondary,
									colors.brand.primary,
								]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={[StyleSheet.absoluteFill, styles.gradientRing]}
							/>
						</Animated.View>
					)}

					<Pressable
						style={styles.fab}
						onPress={handleFabPress}
						accessibilityLabel={menuOpen ? "Đóng player" : "Mở player nhạc"}
						accessibilityRole="button"
						hitSlop={8}>
						<Animated.View style={[StyleSheet.absoluteFill, styles.fabIconCenter, addIconStyle]}>
							<Ionicons name="add" size={s(28)} color={colors.text.inverse} />
						</Animated.View>
						<Animated.View style={[StyleSheet.absoluteFill, styles.fabIconCenter, menuIconStyle]}>
							<Ionicons name="reorder-three" size={s(28)} color={colors.text.inverse} />
						</Animated.View>
					</Pressable>
				</View>

				<MusicPlayerPanel visible={menuOpen} />
			</View>
		</>
	);
}

function createStyles(colors: ThemeColors, bottomInset: number) {
	const outerSize = FAB_SIZE + BORDER_W * 2;
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
		fabGroup: {
			position: "absolute",
			top: -(outerSize / 2 - vs(8)),
			width: outerSize,
			height: outerSize,
			borderRadius: RADIUS.full,
			alignItems: "center",
			justifyContent: "center",
		},
		gradientRing: {
			borderRadius: RADIUS.full,
		},
		fab: {
			width: FAB_SIZE,
			height: FAB_SIZE,
			borderRadius: RADIUS.full,
			backgroundColor: colors.brand.primary,
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
