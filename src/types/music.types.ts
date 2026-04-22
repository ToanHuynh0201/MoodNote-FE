// Music recommendation types (FR-11)

export type RecommendationMode = "MIRROR" | "SHIFT";

export interface TrackSimple {
	id: string;
	trackName: string;
	albumName: string | null;
	durationMs: number | null;
	artists: { name: string }[];
}

export interface Track extends TrackSimple {
	popularity: number | null;
	valence: number | null;
	energy: number | null;
	danceability: number | null;
	acousticness: number | null;
	tempo: number | null;
}

// Returned by GET /music/recent (no audio features)
export interface RecentMusicRecommendation {
	id: string;
	entryId: string;
	mode: RecommendationMode;
	generatedAt: string;
	tracks: { order: number; track: TrackSimple }[];
}

// Returned by GET /music/entries/:entryId/recommendation and POST .../refresh
export interface MusicRecommendation {
	id: string;
	entryId: string;
	mode: RecommendationMode;
	generatedAt: string;
	tracks: { order: number; track: Track }[];
}
