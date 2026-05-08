import { create } from "zustand";

import { audioPlayer } from "@/lib/audioPlayer";
import type { QueueTrack } from "@/types/player.types";

interface PlayerStore {
	queue: QueueTrack[];
	currentIndex: number;
	isPlaying: boolean;
	isLoading: boolean;
	positionMillis: number;
	durationMillis: number;
	entryId: string | null;
	loadPlaylist: (tracks: QueueTrack[], entryId: string) => Promise<void>;
	next: () => Promise<void>;
	previous: () => Promise<void>;
	togglePlay: () => Promise<void>;
}

export const usePlayerStore = create<PlayerStore>((set, get) => {
	audioPlayer.setOnStatusUpdate((isPlaying, didFinish, positionMillis, durationMillis) => {
		set({ isPlaying, isLoading: false, positionMillis, durationMillis });
		if (didFinish) void get().next();
	});

	return {
		queue: [],
		currentIndex: 0,
		isPlaying: false,
		isLoading: false,
		positionMillis: 0,
		durationMillis: 0,
		entryId: null,

		loadPlaylist: async (tracks, entryId) => {
			if (tracks.length === 0) return;
			set({ queue: tracks, currentIndex: 0, entryId, isLoading: true, isPlaying: false, positionMillis: 0, durationMillis: 0 });
			await audioPlayer.loadAndPlay(tracks[0].previewUrl);
		},

		next: async () => {
			const { queue, currentIndex } = get();
			const nextIndex = currentIndex + 1;
			if (nextIndex >= queue.length) {
				set({ isPlaying: false });
				return;
			}
			set({ currentIndex: nextIndex, isLoading: true });
			await audioPlayer.loadAndPlay(queue[nextIndex].previewUrl);
		},

		previous: async () => {
			const { queue, currentIndex } = get();
			const prevIndex = Math.max(0, currentIndex - 1);
			if (prevIndex === currentIndex) return;
			set({ currentIndex: prevIndex, isLoading: true });
			await audioPlayer.loadAndPlay(queue[prevIndex].previewUrl);
		},

		togglePlay: async () => {
			const { isPlaying } = get();
			if (isPlaying) {
				await audioPlayer.pause();
			} else {
				await audioPlayer.resume();
			}
		},
	};
});
