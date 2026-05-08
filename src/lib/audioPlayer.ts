import { Audio } from "expo-av";
import type { AVPlaybackStatus } from "expo-av";

type StatusCallback = (isPlaying: boolean, didFinish: boolean, positionMillis: number, durationMillis: number) => void;

let _sound: Audio.Sound | null = null;
let _onStatus: StatusCallback | null = null;

function handleStatus(status: AVPlaybackStatus) {
	if (!status.isLoaded) return;
	_onStatus?.(status.isPlaying, status.didJustFinish ?? false, status.positionMillis, status.durationMillis ?? 0);
}

export const audioPlayer = {
	setOnStatusUpdate(cb: StatusCallback) {
		_onStatus = cb;
	},

	async loadAndPlay(url: string): Promise<void> {
		if (_sound) {
			await _sound.unloadAsync();
			_sound = null;
		}
		await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
		const { sound } = await Audio.Sound.createAsync({ uri: url });
		_sound = sound;
		_sound.setOnPlaybackStatusUpdate(handleStatus);
		await _sound.playAsync();
	},

	async pause(): Promise<void> {
		await _sound?.pauseAsync();
	},

	async resume(): Promise<void> {
		await _sound?.playAsync();
	},

	async stop(): Promise<void> {
		await _sound?.stopAsync();
		await _sound?.unloadAsync();
		_sound = null;
	},
};
