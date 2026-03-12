import { z } from "zod";

// ─── Reusable field schemas ───────────────────────────────────────────────────

const emailSchema = z.string().min(1, "Email is required").email("Invalid email address");

const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")
	.regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

// ─── Login (FR-02) ───────────────────────────────────────────────────────────

export const loginSchema = z.object({
	identifier: z.string().min(1, "Email hoặc tên đăng nhập là bắt buộc"),
	password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Register (FR-01) ────────────────────────────────────────────────────────

export const registerSchema = z
	.object({
		name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").max(50, "Tên không quá 50 ký tự"),
		username: z
			.string()
			.min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
			.max(30, "Tên đăng nhập không quá 30 ký tự")
			.regex(/^[a-z0-9_]+$/, "Tên đăng nhập chỉ được chứa a-z, 0-9 và _"),
		email: emailSchema,
		password: passwordSchema,
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Forgot Password (FR-03) ─────────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
	email: emailSchema,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// ─── Verify OTP (email verification + forgot-password step 2) ────────────────

export const verifyOtpSchema = z.object({
	otp: z
		.string()
		.length(6, "OTP phải có đúng 6 chữ số")
		.regex(/^\d+$/, "OTP chỉ được chứa chữ số"),
});

export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;

// ─── New Password (forgot-password step 3) ───────────────────────────────────

export const newPasswordSchema = z
	.object({
		password: passwordSchema,
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;

// ─── Reset Password (legacy — otp + password in one step) ────────────────────

export const resetPasswordSchema = z
	.object({
		otp: z
			.string()
			.min(6, "OTP must be 6 digits")
			.max(6, "OTP must be 6 digits")
			.regex(/^\d+$/, "OTP must contain only numbers"),
		password: passwordSchema,
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
