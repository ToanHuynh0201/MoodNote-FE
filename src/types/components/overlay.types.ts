import type { ReactNode } from "react";

export interface ModalProps {
	visible: boolean;
	onDismiss: () => void;
	children: ReactNode;
	title?: string;
	/** Tap backdrop to dismiss — default true */
	dismissible?: boolean;
}

export interface ConfirmationDialogProps {
	visible: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	confirmVariant?: "primary" | "danger";
	onConfirm: () => void;
	onCancel: () => void;
}
