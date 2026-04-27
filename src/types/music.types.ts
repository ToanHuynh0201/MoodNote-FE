// Music recommendation types (FR-11)

export type RecommendationMode = "MIRROR" | "SHIFT";

export type MoodKey =
	| "HAPPY"
	| "EXCITED"
	| "CALM"
	| "CONTENT"
	| "ANGRY"
	| "DISTRESSED"
	| "SAD"
	| "NEUTRAL"
	| "BLENDED";

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

export interface ResolvedCentroid {
	valence: number;
	energy: number;
	acousticness: number;
	danceability: number;
	tempo_norm: number;
}

export interface TrackDiagnostic {
	trackId: string;
	score: number;
	stage?: 1 | 2 | 3;
}

export interface ShiftParams {
	shiftBudget: number;
	alphaMax: number;
	stageAlphas: [number, number, number];
	stageCentroids: [ResolvedCentroid, ResolvedCentroid, ResolvedCentroid];
}

export interface RecommendationDiagnostics {
	moodKey: MoodKey;
	isBlended: boolean;
	resolvedCentroid: ResolvedCentroid;
	trackDiagnostics: TrackDiagnostic[];
	shiftParams?: ShiftParams;
}

// Returned by GET /music/recent, GET /music/entries/:entryId/recommendation, and POST .../refresh
export interface MusicRecommendation {
	id: string;
	entryId: string;
	mode: RecommendationMode;
	generatedAt: string;
	diagnostics: RecommendationDiagnostics | null;
	tracks: { order: number; score: number | null; stage: 1 | 2 | 3 | null; track: Track }[];
}
