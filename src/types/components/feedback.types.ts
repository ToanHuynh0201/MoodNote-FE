import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";

export interface LoadingSpinnerProps {
	size?: "small" | "large";
	/** Defaults to brand.primary */
	color?: string;
	/** true = full-screen with background, false = inline spinner only */
	overlay?: boolean;
	/** Optional label shown below the spinner */
	message?: string;
}

export interface SkeletonLoaderProps {
	width?: number | `${number}%`;
	height?: number;
	borderRadius?: number;
	style?: ViewStyle;
}

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
	message: string;
	type?: ToastType;
	/** Duration in ms before auto-dismiss — default 3000 */
	duration?: number;
}

export interface ToastProviderProps {
	children: ReactNode;
}

export type StatusIndicatorStatus = "saving" | "saved" | "error" | "online" | "offline";

export interface StatusIndicatorProps {
	status: StatusIndicatorStatus;
	showLabel?: boolean;
}

export interface EmptyStateProps {
	icon?: ReactNode;
	title: string;
	subtitle?: string;
	action?: {
		label: string;
		onPress: () => void;
	};
}
