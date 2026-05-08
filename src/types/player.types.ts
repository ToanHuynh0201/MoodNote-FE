export interface QueueTrack {
	id: string;
	trackName: string;
	artists: string[];
	albumName: string | null;
	durationMs: number | null;
	previewUrl: string;
}
