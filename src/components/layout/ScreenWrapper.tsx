import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, type ReactNode } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	View,
	type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenWrapperProps {
	children: ReactNode;
	keyboard?: boolean;
	style?: ViewStyle;
	padded?: boolean;
}

export function ScreenWrapper({
	children,
	keyboard = false,
	style,
	padded = true,
}: ScreenWrapperProps) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const inner = (
		<View style={[styles.inner, padded && styles.padded, style]}>{children}</View>
	);

	return (
		<LinearGradient
			colors={[colors.background.secondary, colors.background.primary]}
			style={styles.gradient}
		>
			<SafeAreaView style={styles.safeArea}>
				{keyboard ? (
					<KeyboardAvoidingView
						behavior={Platform.OS === "ios" ? "padding" : "height"}
						style={styles.keyboard}
					>
						{inner}
					</KeyboardAvoidingView>
				) : (
					inner
				)}
			</SafeAreaView>
		</LinearGradient>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		gradient: {
			flex: 1,
		},
		safeArea: {
			flex: 1,
			backgroundColor: "transparent",
		},
		keyboard: {
			flex: 1,
		},
		inner: {
			flex: 1,
		},
		padded: {
			paddingHorizontal: 24,
		},
	});
}
