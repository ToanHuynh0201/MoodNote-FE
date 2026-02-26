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
	email: emailSchema,
	password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Register (FR-01) ────────────────────────────────────────────────────────

export const registerSchema = z
	.object({
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

// ─── Reset Password ───────────────────────────────────────────────────────────

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
