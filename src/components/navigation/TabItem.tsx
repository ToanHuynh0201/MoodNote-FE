import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
	Extrapolation,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";

import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import { s } from "@/utils";
import type { IoniconName } from "@/constants";
import { TAB_ICONS } from "@/constants";

interface Props {
	label: string;
	routeName: string;
	isFocused: boolean;
	onPress: () => void;
	onLongPress: () => void;
	colors: ThemeColors;
	unreadCount?: number;
}

export function TabItem({ label, routeName, isFocused, onPress, onLongPress, colors, unreadCount = 0 }: Props) {
	const iconConfig = TAB_ICONS[routeName] ?? { active: "ellipse", inactive: "ellipse-outline" };
	const iconName: IoniconName = isFocused ? iconConfig.active : iconConfig.inactive;
	const iconColor = isFocused ? colors.nav.activeIcon : colors.nav.inactiveIcon;
	const labelColor = isFocused ? colors.nav.activeTint : colors.nav.inactiveTint;

	const itemStyles = useMemo(() => createItemStyles(colors), [colors]);

	// 0 = inactive, 1 = active — drives icon scale + label fade
	const progress = useSharedValue(isFocused ? 1 : 0);
	// Press feedback
	const pressScale = useSharedValue(1);

	useEffect(() => {
		progress.value = withSpring(isFocused ? 1 : 0, {
			damping: 14,
			stiffness: 180,
			mass: 0.8,
		});
	}, [isFocused, progress]);

	const iconAnimStyle = useAnimatedStyle(() => ({
		transform: [{ scale: 0.88 + progress.value * 0.12 }],
	}));

	// Label container: height collapses to 0 when unfocused so it doesn't push icon up
	const labelContainerStyle = useAnimatedStyle(() => ({
		height: interpolate(progress.value, [0, 1], [0, LINE_HEIGHT.tight], Extrapolation.CLAMP),
		marginTop: interpolate(progress.value, [0, 1], [0, SPACING[4]], Extrapolation.CLAMP),
	}));

	const labelAnimStyle = useAnimatedStyle(() => ({
		opacity: withTiming(progress.value, { duration: 150 }),
		transform: [{ translateY: (1 - progress.value) * 4 }],
	}));

	const pressAnimStyle = useAnimatedStyle(() => ({
		transform: [{ scale: pressScale.value }],
	}));

	const handlePressIn = useCallback(() => {
		pressScale.value = withTiming(0.85, { duration: 80 });
	}, [pressScale]);

	const handlePressOut = useCallback(() => {
		pressScale.value = withSpring(1, { damping: 10, stiffness: 200 });
	}, [pressScale]);

	return (
		<Pressable
			style={itemStyles.pressable}
			onPress={onPress}
			onLongPress={onLongPress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			accessibilityRole="tab"
			accessibilityLabel={label}
			accessibilityState={{ selected: isFocused }}
			hitSlop={8}>
			<Animated.View style={[itemStyles.inner, pressAnimStyle]}>
				<View style={itemStyles.iconWrapper}>
					<Animated.View style={iconAnimStyle}>
						<Ionicons name={iconName} size={s(22)} color={iconColor} />
					</Animated.View>
					{unreadCount > 0 && (
						<View style={itemStyles.badge}>
							<Text style={itemStyles.badgeText}>
								{unreadCount > 99 ? "99+" : unreadCount}
							</Text>
						</View>
					)}
				</View>
				<Animated.View style={[itemStyles.labelContainer, labelContainerStyle]}>
					<Animated.Text style={[itemStyles.label, { color: labelColor }, labelAnimStyle]}>
						{label}
					</Animated.Text>
				</Animated.View>
			</Animated.View>
		</Pressable>
	);
}

function createItemStyles(colors: ThemeColors) {
	return StyleSheet.create({
		pressable: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
			paddingVertical: SPACING[8],
		},
		inner: {
			alignItems: "center",
		},
		iconWrapper: {
			position: "relative",
		},
		badge: {
			position: "absolute",
			top: -s(4),
			right: -s(6),
			minWidth: s(16),
			height: s(16),
			borderRadius: RADIUS.full,
			backgroundColor: colors.status.error,
			alignItems: "center",
			justifyContent: "center",
			paddingHorizontal: s(3),
			borderWidth: 1.5,
			borderColor: colors.nav.background,
		},
		badgeText: {
			fontSize: FONT_SIZE[11],
			lineHeight: LINE_HEIGHT.tight,
			color: colors.text.inverse,
			fontWeight: "700",
		},
		labelContainer: {
			overflow: "hidden",
			alignItems: "center",
		},
		label: {
			fontSize: FONT_SIZE[11],
			lineHeight: LINE_HEIGHT.tight,
		},
	});
}
