// Music recommendation types

export interface Artist {
	name: string;
}

export interface Track {
	id: string;
	trackName: string;
	albumName: string;
	durationMs: number;
	artists: Artist[];
	albumImageUrl?: string | null;
}

export interface RecommendationTrack {
	order: number;
	track: Track;
}

export interface MusicRecommendation {
	id: string;
	entryId: string;
	mode: string;
	generatedAt: string;
	tracks: RecommendationTrack[];
}
