// Music recommendation API calls

import { apiService as api } from "@/lib/api";
import type { ApiResponse } from "@/types";
import type { MusicRecommendation } from "@/types/music.types";
import { withErrorHandling } from "@/utils/error";

export const musicService = {
	// GET /music/recent?limit=4 → most recent playlist recommendation
	getRecent: withErrorHandling((limit = 4) =>
		api.get<ApiResponse<{ recommendation: MusicRecommendation | null }>>("/music/recent", {
			params: { limit },
		}),
	),
};
