import { useCallback } from "react";

import { usePlayerStore } from "@/store/player.store";
import type { Track } from "@/types/music.types";
import type { QueueTrack } from "@/types/player.types";

function toQueueTrack(track: Track): QueueTrack {
	return {
		id: track.id,
		trackName: track.trackName,
		artists: track.artists.map((a) => a.name),
		albumName: track.albumName,
		durationMs: track.durationMs,
		previewUrl: track.previewUrl as string,
	};
}

export function usePlayer() {
	const queue = usePlayerStore((s) => s.queue);
	const currentIndex = usePlayerStore((s) => s.currentIndex);
	const isPlaying = usePlayerStore((s) => s.isPlaying);
	const isLoading = usePlayerStore((s) => s.isLoading);
	const positionMillis = usePlayerStore((s) => s.positionMillis);
	const durationMillis = usePlayerStore((s) => s.durationMillis);
	const entryId = usePlayerStore((s) => s.entryId);
	const loadPlaylist = usePlayerStore((s) => s.loadPlaylist);
	const next = usePlayerStore((s) => s.next);
	const previous = usePlayerStore((s) => s.previous);
	const togglePlay = usePlayerStore((s) => s.togglePlay);

	const currentTrack = queue[currentIndex] ?? null;
	const hasQueue = queue.length > 0;

	const playPlaylist = useCallback(
		async (tracks: Track[], entryId: string) => {
			const queueTracks = tracks.flatMap((t) => (t.previewUrl ? [toQueueTrack(t)] : []));
			if (queueTracks.length > 0) {
				await loadPlaylist(queueTracks, entryId);
			}
		},
		[loadPlaylist],
	);

	return {
		currentTrack,
		isPlaying,
		isLoading,
		hasQueue,
		queue,
		currentIndex,
		positionMillis,
		durationMillis,
		entryId,
		playPlaylist,
		next,
		previous,
		togglePlay,
	};
}
