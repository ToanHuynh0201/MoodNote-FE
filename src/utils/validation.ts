// Zod validation schemas matching SRS acceptance criteria
// TODO: Install zod + react-hook-form: npx expo install zod @hookform/resolvers react-hook-form

import { z } from "zod";

// --- Auth schemas (FR-01 to FR-04) ---

// Password must be 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char (NFR-09)
const PASSWORD_REGEX =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_+=])[A-Za-z\d@$!%*?&#^()\-_+=]{8,}$/;

// TODO: uncomment once zod is installed
export const loginSchema = z.object({
	email: z.string().email("Email không hợp lệ").toLowerCase(),
	password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const registerSchema = z
	.object({
		email: z.string().email("Email không hợp lệ").toLowerCase(),
		password: z
			.string()
			.regex(
				PASSWORD_REGEX,
				"Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt",
			),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Mật khẩu xác nhận không khớp",
		path: ["confirmPassword"],
	});

export const forgotPasswordSchema = z.object({
	email: z.string().email("Email không hợp lệ").toLowerCase(),
});

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
		newPassword: z
			.string()
			.regex(
				PASSWORD_REGEX,
				"Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt",
			),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Mật khẩu xác nhận không khớp",
		path: ["confirmPassword"],
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		message: "Mật khẩu mới phải khác mật khẩu hiện tại",
		path: ["newPassword"],
	});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Temporary plain validators (used before zod is installed)
export const validators = {
	isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
	isValidPassword: (password: string) => PASSWORD_REGEX.test(password),
};
