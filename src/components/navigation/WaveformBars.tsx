import { useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";

import { s, vs } from "@/utils";

interface Props {
	isPlaying: boolean;
	color: string;
	size?: "sm" | "md";
}

export function WaveformBars({ isPlaying, color, size = "md" }: Props) {
	const { maxH1, maxH2, maxH3, containerH, minH } = useMemo(() => {
		const isSm = size === "sm";
		return {
			maxH1: isSm ? vs(8) : vs(13),
			maxH2: isSm ? vs(12) : vs(18),
			maxH3: isSm ? vs(6) : vs(10),
			containerH: isSm ? vs(12) : vs(18),
			minH: vs(4),
		};
	}, [size]);

	const h1 = useSharedValue(minH);
	const h2 = useSharedValue(minH);
	const h3 = useSharedValue(minH);

	const anim1 = useAnimatedStyle(() => ({ height: h1.value }));
	const anim2 = useAnimatedStyle(() => ({ height: h2.value }));
	const anim3 = useAnimatedStyle(() => ({ height: h3.value }));

	useEffect(() => {
		if (isPlaying) {
			h1.value = withRepeat(
				withTiming(maxH1, { duration: 500, easing: Easing.inOut(Easing.sin) }),
				-1,
				true,
			);
			h2.value = withRepeat(
				withTiming(maxH2, { duration: 750, easing: Easing.inOut(Easing.sin) }),
				-1,
				true,
			);
			h3.value = withRepeat(
				withTiming(maxH3, { duration: 600, easing: Easing.inOut(Easing.sin) }),
				-1,
				true,
			);
		} else {
			h1.value = withTiming(minH);
			h2.value = withTiming(minH);
			h3.value = withTiming(minH);
		}
	}, [isPlaying, h1, h2, h3, maxH1, maxH2, maxH3, minH]);

	const barStyle = useMemo(
		() => ({ width: s(3), borderRadius: s(2), backgroundColor: color, opacity: 0.9 }),
		[color],
	);

	return (
		<View style={{ flexDirection: "row", alignItems: "flex-end", gap: s(2), height: containerH }}>
			<Animated.View style={[barStyle, anim1]} />
			<Animated.View style={[barStyle, anim2]} />
			<Animated.View style={[barStyle, anim3]} />
		</View>
	);
}
