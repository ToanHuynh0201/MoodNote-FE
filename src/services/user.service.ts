import { apiService as api } from "@/lib/api";
import type { ApiResponse } from "@/types";
import type { UpdateProfilePayload, User } from "@/types/user.types";
import { withErrorHandling } from "@/utils/error";

// FR-05: User profile management
export const userService = {
	// GET /users/me → data: User (flat, not nested)
	getMe: withErrorHandling(() => api.get<ApiResponse<User>>("/users/me")),

	// PATCH /users/me → data: User
	updateMe: withErrorHandling((payload: UpdateProfilePayload) =>
		api.patch<ApiResponse<User>>("/users/me", payload),
	),
};
