import { useThemeColors } from "@/hooks";
import { LinearGradient } from "expo-linear-gradient";
import { type ReactNode } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	View,
	type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Ambient glow blobs ────────────────────────────────────────────────────────
// Simulate Gaussian blur via layered concentric circles with low opacity.
// Each layer is a sibling View — opacities add up at the center, creating a
// smooth radial falloff that approximates a soft glow.

const BLOB_LAYERS = [
	{ factor: 1.00, opacity: 0.03  },
	{ factor: 0.91, opacity: 0.035 },
	{ factor: 0.82, opacity: 0.04  },
	{ factor: 0.74, opacity: 0.045 },
	{ factor: 0.65, opacity: 0.05  },
	{ factor: 0.57, opacity: 0.055 },
	{ factor: 0.50, opacity: 0.06  },
	{ factor: 0.42, opacity: 0.065 },
	{ factor: 0.35, opacity: 0.07  },
	{ factor: 0.27, opacity: 0.06  },
	{ factor: 0.20, opacity: 0.05  },
	{ factor: 0.12, opacity: 0.04  },
] as const;
// Cumulative at center ≈ 0.60; at outer edge ≈ 0.03

interface BlobProps {
	color: string;
	radius: number;
	top?: number;
	bottom?: number;
	left?: number;
	right?: number;
}

function Blob({ color, radius, top, bottom, left, right }: BlobProps) {
	const size = radius * 2;
	return (
		<View
			pointerEvents="none"
			style={{
				position: "absolute",
				top,
				bottom,
				left,
				right,
				width: size,
				height: size,
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			{BLOB_LAYERS.map(({ factor, opacity }, i) => {
				const r = radius * factor;
				return (
					<View
						key={i}
						style={{
							position: "absolute",
							width: r * 2,
							height: r * 2,
							borderRadius: r,
							backgroundColor: color,
							opacity,
						}}
					/>
				);
			})}
		</View>
	);
}

// ── ScreenWrapper ─────────────────────────────────────────────────────────────

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

	const inner = (
		<View style={[styles.inner, padded && styles.padded, style]}>{children}</View>
	);

	return (
		<LinearGradient
			colors={[colors.background.secondary, colors.background.primary]}
			style={styles.gradient}
		>
			{/* Ambient glow blobs — positioned absolutely behind all content */}
			<View style={StyleSheet.absoluteFillObject} pointerEvents="none">
				<Blob color={colors.brand.secondary} radius={180} top={-80} right={-80} />
				<Blob color={colors.brand.primary}   radius={140} top={280} left={-100} />
				<Blob color={colors.brand.secondary} radius={130} bottom={-60} right={-50} />
			</View>

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

const styles = StyleSheet.create({
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
