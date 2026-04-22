// Music recommendation API calls

import { apiService as api } from "@/lib/api";
import type { ApiResponse } from "@/types";
import type { MusicRecommendation, RecentMusicRecommendation } from "@/types/music.types";
import { withErrorHandling } from "@/utils/error";

export const musicService = {
	// GET /music/recent?limit=5 → most recent playlist recommendation (TrackSimple, no audio features)
	getRecent: withErrorHandling((limit = 5) =>
		api.get<ApiResponse<{ recommendation: RecentMusicRecommendation | null }>>("/music/recent", {
			params: { limit },
		}),
	),

	// GET /music/entries/:entryId/recommendation → cached recommendation (Track with audio features)
	// Returns 200 with data when cached, 202 with data: null when still generating
	getByEntry: withErrorHandling((entryId: string) =>
		api.get<ApiResponse<{ recommendation: MusicRecommendation } | null>>(
			`/music/entries/${entryId}/recommendation`,
		),
	),

	// POST /music/entries/:entryId/recommendation/refresh → regenerate recommendation
	refreshRecommendation: withErrorHandling((entryId: string) =>
		api.post<ApiResponse<{ recommendation: MusicRecommendation }>>(
			`/music/entries/${entryId}/recommendation/refresh`,
		),
	),
};
