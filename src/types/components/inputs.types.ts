import type { ReactNode, Ref } from "react";
import type { TextInput as RNTextInput, TextInputProps } from "react-native";

export interface InputProps extends TextInputProps {
	ref?: Ref<RNTextInput>;
	label?: string;
	error?: string;
	hint?: string;
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
}

export interface TextAreaProps extends Omit<TextInputProps, "multiline" | "textAlignVertical"> {
	label?: string;
	error?: string;
	hint?: string;
	maxLength?: number;
	showCharCount?: boolean;
	minHeight?: number;
}

export interface SearchBarProps {
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	onClear?: () => void;
	autoFocus?: boolean;
}

export interface ToggleSwitchProps {
	value: boolean;
	onValueChange: (value: boolean) => void;
	label?: string;
	sublabel?: string;
	disabled?: boolean;
}

export interface SegmentOption {
	label: string;
	value: string;
}

export interface SegmentedControlProps {
	options: SegmentOption[];
	value: string;
	onChange: (value: string) => void;
}

export interface PinInputProps {
	value: string;
	onChange: (value: string) => void;
	length?: number;
	error?: boolean;
	autoFocus?: boolean;
	secureEntry?: boolean;
}
