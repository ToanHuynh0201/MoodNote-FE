import type { ReactNode } from "react";
import type { ViewProps } from "react-native";

export interface CardProps extends ViewProps {
	children: ReactNode;
	variant?: "elevated" | "flat" | "bordered";
	/** Pass a number to override padding, or false to remove padding entirely */
	padding?: number | false;
}

export interface BadgeProps {
	label: string;
	/** Background color — defaults to brand.surface */
	color?: string;
	/** Text color — defaults to brand.primary */
	textColor?: string;
	size?: "sm" | "md";
	/** Makes the badge pressable */
	onPress?: () => void;
	/** Shows × dismiss button */
	onDismiss?: () => void;
}

export interface AvatarProps {
	uri?: string;
	/** Fallback initials source — first 2 characters used */
	name?: string;
	size?: "sm" | "md" | "lg";
	onPress?: () => void;
}

export interface DividerProps {
	/** Optional label displayed at the centre of the line */
	label?: string;
	/** Vertical margin on both sides — default 8 */
	spacing?: number;
}

export interface ProgressBarProps {
	/** 0–100 */
	value: number;
	/** Defaults to brand.primary */
	color?: string;
	/** Defaults to background.secondary */
	trackColor?: string;
	height?: number;
	animated?: boolean;
	showLabel?: boolean;
}

export interface SectionHeaderProps {
	title: string;
	action?: {
		label: string;
		onPress: () => void;
	};
}
