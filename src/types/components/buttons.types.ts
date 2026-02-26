import type { ReactNode } from "react";

export interface ButtonProps {
	title: string;
	onPress: () => void;
	variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
	size?: "sm" | "md" | "lg";
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	loading?: boolean;
	disabled?: boolean;
	fullWidth?: boolean;
	accessibilityLabel?: string;
}

export interface IconButtonProps {
	icon: ReactNode;
	onPress: () => void;
	/** sm=32, md=40, lg=48 */
	size?: "sm" | "md" | "lg";
	variant?: "ghost" | "filled" | "outline";
	/** Required — icon has no visible text label */
	accessibilityLabel: string;
	hitSlop?: number;
	disabled?: boolean;
}
