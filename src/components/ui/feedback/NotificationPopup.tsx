// In-app notification popup — slides down from the top on foreground push events

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import { s } from "@/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationPopupType = "info" | "success" | "warning" | "error";

export interface NotificationPopupOptions {
	title?: string;
	message: string;
	type?: NotificationPopupType;
	duration?: number;
}

export interface NotificationPopupContextValue {
	show: (options: NotificationPopupOptions) => void;
}

interface PopupState {
	id: string;
	title: string | undefined;
	message: string;
	type: NotificationPopupType;
	duration: number;
}

interface NotificationPopupProviderProps {
	children: React.ReactNode;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const POPUP_SLIDE_OFFSET = -120;

const ICON_MAP: Record<NotificationPopupType, React.ComponentProps<typeof Ionicons>["name"]> = {
	info: "information-circle",
	success: "checkmark-circle",
	warning: "warning",
	error: "close-circle",
};

function getTypeColors(type: NotificationPopupType, colors: ThemeColors) {
	switch (type) {
		case "info":
			return { bg: colors.background.elevated, accent: colors.status.info, icon: colors.status.info };
		case "success":
			return { bg: colors.background.elevated, accent: colors.status.success, icon: colors.status.success };
		case "warning":
			return { bg: colors.background.elevated, accent: colors.status.warning, icon: colors.status.warning };
		case "error":
			return { bg: colors.background.elevated, accent: colors.status.error, icon: colors.status.error };
	}
}

// ─── Context ──────────────────────────────────────────────────────────────────

const NotificationPopupContext = createContext<NotificationPopupContextValue | null>(null);

export function NotificationPopupProvider({ children }: NotificationPopupProviderProps) {
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();
	const styles = useMemo(() => createStyles(colors, insets.top), [colors, insets.top]);

	const [popup, setPopup] = useState<PopupState | null>(null);
	const slideAnim = useRef(new Animated.Value(POPUP_SLIDE_OFFSET)).current;
	const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	const hide = useCallback(() => {
		Animated.timing(slideAnim, {
			toValue: POPUP_SLIDE_OFFSET,
			duration: 250,
			useNativeDriver: true,
		}).start(() => setPopup(null));
	}, [slideAnim]);

	const show = useCallback(
		(options: NotificationPopupOptions) => {
			if (timerRef.current) clearTimeout(timerRef.current);

			const newPopup: PopupState = {
				id: Math.random().toString(36).slice(2),
				title: options.title,
				message: options.message,
				type: options.type ?? "info",
				duration: options.duration ?? 4000,
			};

			setPopup(newPopup);
			slideAnim.setValue(POPUP_SLIDE_OFFSET);

			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 350,
				useNativeDriver: true,
			}).start();

			timerRef.current = setTimeout(hide, newPopup.duration);
		},
		[slideAnim, hide],
	);

	useEffect(() => {
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

	const contextValue = useMemo(() => ({ show }), [show]);

	const typeColors = popup != null ? getTypeColors(popup.type, colors) : null;

	return (
		<NotificationPopupContext.Provider value={contextValue}>
			<View style={styles.wrapper}>
				{children}
				{popup != null && typeColors != null && (
					<Animated.View
						style={[
							styles.popup,
							{
								backgroundColor: typeColors.bg,
								borderLeftColor: typeColors.accent,
								transform: [{ translateY: slideAnim }],
							},
						]}>
						{/* Icon */}
						<View style={styles.iconWrap}>
							<Ionicons name={ICON_MAP[popup.type]} size={s(22)} color={typeColors.icon} />
						</View>

						{/* Content */}
						<View style={styles.content}>
							{popup.title != null && (
								<Text style={styles.title} numberOfLines={1}>
									{popup.title}
								</Text>
							)}
							<Text style={styles.message} numberOfLines={3}>
								{popup.message}
							</Text>
						</View>

						{/* Close */}
						<Pressable
							onPress={hide}
							hitSlop={8}
							accessibilityLabel="Đóng thông báo"
							accessibilityRole="button"
							style={styles.closeBtn}>
							<Ionicons name="close" size={s(18)} color={colors.text.muted} />
						</Pressable>
					</Animated.View>
				)}
			</View>
		</NotificationPopupContext.Provider>
	);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotificationPopup(): NotificationPopupContextValue {
	const ctx = useContext(NotificationPopupContext);
	if (ctx === null) {
		throw new Error("useNotificationPopup must be used within <NotificationPopupProvider>");
	}
	return ctx;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function createStyles(colors: ThemeColors, topInset: number) {
	return StyleSheet.create({
		wrapper: { flex: 1 },
		// elevation is intentionally omitted on Android — it causes a white surface artifact
		// around borderRadius. iOS shadow is used instead.
		popup: {
			position: "absolute",
			top: topInset + SPACING[8],
			left: SPACING[16],
			right: SPACING[16],
			flexDirection: "row",
			alignItems: "center",
			borderRadius: RADIUS.lg,
			borderLeftWidth: s(4),
			...Platform.select({
				ios: {
					shadowColor: colors.shadow,
					shadowOffset: { width: 0, height: s(4) },
					shadowOpacity: 0.15,
					shadowRadius: s(8),
				},
			}),
		},
		iconWrap: {
			paddingLeft: SPACING[12],
			paddingVertical: SPACING[14],
		},
		content: {
			flex: 1,
			paddingLeft: SPACING[10],
			paddingVertical: SPACING[12],
			gap: SPACING[2],
		},
		title: {
			fontSize: FONT_SIZE[14],
			fontWeight: "700",
			color: colors.text.primary,
			lineHeight: LINE_HEIGHT.tight,
		},
		message: {
			fontSize: FONT_SIZE[13],
			color: colors.text.secondary,
			lineHeight: LINE_HEIGHT.normal,
		},
		closeBtn: {
			paddingHorizontal: SPACING[12],
			paddingVertical: SPACING[14],
		},
	});
}
