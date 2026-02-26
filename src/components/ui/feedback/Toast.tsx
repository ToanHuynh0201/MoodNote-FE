import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import type { ToastOptions, ToastProviderProps, ToastType } from "@/types";

// ─── Internal types ────────────────────────────────────────────────────────────

interface ToastContextValue {
	show: (options: ToastOptions) => void;
}

interface ToastState extends Required<ToastOptions> {
	id: string;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: ToastProviderProps) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const [toast, setToast] = useState<ToastState | null>(null);
	const slideAnim = useRef(new Animated.Value(80)).current;
	const opacityAnim = useRef(new Animated.Value(0)).current;
	const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	const hide = useCallback(() => {
		Animated.parallel([
			Animated.timing(slideAnim, {
				toValue: 80,
				duration: 250,
				useNativeDriver: true,
			}),
			Animated.timing(opacityAnim, {
				toValue: 0,
				duration: 250,
				useNativeDriver: true,
			}),
		]).start(() => setToast(null));
	}, [slideAnim, opacityAnim]);

	const show = useCallback(
		(options: ToastOptions) => {
			if (timerRef.current) clearTimeout(timerRef.current);

			const newToast: ToastState = {
				id: Math.random().toString(36).slice(2),
				message: options.message,
				type: options.type ?? "info",
				duration: options.duration ?? 3000,
			};

			setToast(newToast);
			slideAnim.setValue(80);
			opacityAnim.setValue(0);

			Animated.parallel([
				Animated.timing(slideAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true,
				}),
				Animated.timing(opacityAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}),
			]).start();

			timerRef.current = setTimeout(hide, newToast.duration);
		},
		[slideAnim, opacityAnim, hide],
	);

	useEffect(() => {
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

	const contextValue = useMemo(() => ({ show }), [show]);

	const iconName = toast != null ? ICON_MAP[toast.type] : "information-circle";
	const toastStyle = toast != null ? styles[toast.type] : undefined;
	const iconColor = toast != null ? ICON_COLOR_KEY[toast.type] : undefined;

	return (
		<ToastContext.Provider value={contextValue}>
			<View style={styles.wrapper}>
				{children}
				{toast != null && (
					<Animated.View
						style={[
							styles.toast,
							toastStyle,
							{
								transform: [{ translateY: slideAnim }],
								opacity: opacityAnim,
							},
						]}>
						<Ionicons
							name={iconName}
							size={20}
							color={iconColor != null ? colors.status[iconColor] : colors.text.primary}
							style={styles.icon}
						/>
						<Text style={styles.message} numberOfLines={2}>
							{toast.message}
						</Text>
						<Pressable
							onPress={hide}
							hitSlop={8}
							accessibilityLabel="Đóng thông báo"
							accessibilityRole="button">
							<Ionicons name="close" size={18} color={colors.text.secondary} />
						</Pressable>
					</Animated.View>
				)}
			</View>
		</ToastContext.Provider>
	);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
	const ctx = useContext(ToastContext);
	if (ctx === null) {
		throw new Error("useToast must be used within <ToastProvider>");
	}
	return ctx;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<ToastType, React.ComponentProps<typeof Ionicons>["name"]> = {
	success: "checkmark-circle",
	error: "alert-circle",
	warning: "warning",
	info: "information-circle",
};

type StatusColorKey = "success" | "error" | "warning" | "info";
const ICON_COLOR_KEY: Record<ToastType, StatusColorKey> = {
	success: "success",
	error: "error",
	warning: "warning",
	info: "info",
};

// ─── Styles ───────────────────────────────────────────────────────────────────

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		wrapper: { flex: 1 },
		toast: {
			position: "absolute",
			bottom: 32,
			left: 16,
			right: 16,
			flexDirection: "row",
			alignItems: "center",
			borderRadius: 12,
			paddingVertical: 12,
			paddingHorizontal: 14,
			shadowColor: colors.shadow,
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.15,
			shadowRadius: 12,
			elevation: 8,
			backgroundColor: colors.background.elevated,
		},
		success: { backgroundColor: colors.status.successBackground },
		error: { backgroundColor: colors.status.errorBackground },
		warning: { backgroundColor: colors.status.warningBackground },
		info: { backgroundColor: colors.status.infoBackground },
		icon: { marginRight: 10 },
		message: {
			flex: 1,
			fontSize: 14,
			color: colors.text.primary,
			marginRight: 8,
		},
	});
}
