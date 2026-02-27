import {
	EmotionIllustration,
	JournalIllustration,
	MusicIllustration,
} from "@/components/ui/illustrations";
import { Button } from "@/components/ui";
import { ScreenWrapper } from "@/components/layout";
import { ONBOARDING_COMPLETED_KEY, ROUTES } from "@/constants";
import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { setStorageItem } from "@/utils/storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
	Easing,
	FadeIn,
	FadeInDown,
	ZoomIn,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";

// ─── Slide Data ───────────────────────────────────────────────────────────────

interface Slide {
	title: string;
	Illustration: ComponentType;
}

const SLIDES: Slide[] = [
	{
		title: "Viết lại cảm xúc\nngày hôm nay",
		Illustration: JournalIllustration,
	},
	{
		title: "Thấu hiểu cảm xúc\ncủa bạn",
		Illustration: EmotionIllustration,
	},
	{
		title: "Nghe và chill\ntheo cảm xúc thật",
		Illustration: MusicIllustration,
	},
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ArrowButtonProps {
	onPress: () => void;
	styles: ReturnType<typeof createStyles>;
	colors: ThemeColors;
}

function ArrowButton({ onPress, styles, colors }: ArrowButtonProps) {
	const scale = useSharedValue(1);

	useEffect(() => {
		scale.value = withRepeat(
			withSequence(
				withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
				withTiming(1.0, { duration: 800, easing: Easing.inOut(Easing.sin) }),
			),
			-1,
			false,
		);
	}, [scale]);

	const animStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return (
		<Animated.View style={animStyle}>
			<Pressable
				style={styles.arrowButton}
				onPress={onPress}
				accessibilityLabel="Bắt đầu"
				accessibilityRole="button"
			>
				<LinearGradient
					colors={[colors.brand.secondary, colors.brand.primary]}
					style={styles.arrowGradient}
				>
					<Text style={styles.arrowIcon}>→</Text>
				</LinearGradient>
			</Pressable>
		</Animated.View>
	);
}

function FloatingContainer({ children }: { children: ReactNode }) {
	const translateY = useSharedValue(0);

	useEffect(() => {
		translateY.value = withRepeat(
			withSequence(
				withTiming(-12, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
				withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
			),
			-1,
			false,
		);
	}, [translateY]);

	const animStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	return <Animated.View style={animStyle}>{children}</Animated.View>;
}

interface AnimatedDotProps {
	isActive: boolean;
	styles: ReturnType<typeof createStyles>;
}

function AnimatedDot({ isActive, styles }: AnimatedDotProps) {
	const width = useSharedValue(isActive ? 20 : 8);

	useEffect(() => {
		width.value = withTiming(isActive ? 20 : 8, { duration: 250 });
	}, [isActive, width]);

	const animStyle = useAnimatedStyle(() => ({
		width: width.value,
	}));

	return (
		<Animated.View
			style={[styles.dot, isActive && styles.dotActiveColor, animStyle]}
		/>
	);
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const [step, setStep] = useState(0);

	const markDoneAndNavigate = useCallback(async () => {
		await setStorageItem(ONBOARDING_COMPLETED_KEY, "true");
		router.replace(ROUTES.WELCOME);
	}, []);

	const handleNext = useCallback(async () => {
		if (step < SLIDES.length) {
			setStep(step + 1);
		} else {
			await markDoneAndNavigate();
		}
	}, [step, markDoneAndNavigate]);

	// ── Step 0: Splash ─────────────────────────────────────────────────────────
	if (step === 0) {
		return (
			<ScreenWrapper padded={false}>
				<View style={styles.splashContent}>
					<Animated.View entering={ZoomIn.duration(500)}>
						<Image
							source={require("../../../assets/images/splash-icon.png")}
							style={styles.splashLogo}
							resizeMode="contain"
						/>
					</Animated.View>
					<Animated.View entering={FadeInDown.duration(400).delay(200)}>
						<Text style={styles.splashTitle}>MoodNote</Text>
					</Animated.View>
					<Animated.View entering={FadeInDown.duration(400).delay(350)}>
						<Text style={styles.splashSubtitle}>
							{"Mọi thứ trở nên ổn áo, hãy ở đây một chút,\ncùng âm nhạc và sự lắng nghe."}
						</Text>
					</Animated.View>
				</View>

				<View style={styles.splashFooter}>
					<Animated.View entering={FadeIn.duration(400).delay(500)}>
						<ArrowButton
							onPress={() => setStep(1)}
							styles={styles}
							colors={colors}
						/>
					</Animated.View>
				</View>
			</ScreenWrapper>
		);
	}

	// ── Steps 1-3: Slides ──────────────────────────────────────────────────────
	const slideIndex = step - 1;
	const slide = SLIDES[slideIndex];
	const { Illustration } = slide;
	const isLastSlide = step === SLIDES.length;

	return (
		<ScreenWrapper padded={false}>
			{/* Skip */}
			<View style={styles.skipRow}>
				<Button
					title="Skip"
					variant="ghost"
					size="sm"
					onPress={markDoneAndNavigate}
					accessibilityLabel="Bỏ qua phần giới thiệu"
				/>
			</View>

			{/* Slide content animates on step change */}
			<Animated.View key={step} entering={FadeIn.duration(350)} style={styles.slideContent}>
				{/* Illustration */}
				<View style={styles.illustrationContainer}>
					<FloatingContainer>
						<Illustration />
					</FloatingContainer>
				</View>

				{/* Bottom content */}
				<View style={styles.slideBottom}>
					<Text style={styles.slideTitle}>{slide.title}</Text>

					{/* Dots */}
					<View style={styles.dots}>
						{SLIDES.map((_, i) => (
							<AnimatedDot
								key={i}
								isActive={i === slideIndex}
								styles={styles}
							/>
						))}
					</View>

					<Button
						title={isLastSlide ? "Bắt đầu" : "Tiếp theo"}
						variant="primary"
						size="lg"
						fullWidth
						onPress={handleNext}
						accessibilityLabel={isLastSlide ? "Hoàn thành giới thiệu" : "Sang slide tiếp theo"}
					/>
				</View>
			</Animated.View>
		</ScreenWrapper>
	);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		// Splash
		splashContent: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
			gap: 16,
			paddingHorizontal: 32,
		},
		splashLogo: {
			width: 100,
			height: 100,
		},
		splashTitle: {
			color: colors.text.primary,
			fontSize: 36,
			fontWeight: "700",
			letterSpacing: 1,
		},
		splashSubtitle: {
			color: colors.text.secondary,
			fontSize: 14,
			textAlign: "center",
			lineHeight: 22,
		},
		splashFooter: {
			alignItems: "center",
			paddingBottom: 48,
		},
		arrowButton: {
			borderRadius: 32,
			overflow: "hidden",
		},
		arrowGradient: {
			width: 64,
			height: 64,
			alignItems: "center",
			justifyContent: "center",
			borderRadius: 32,
		},
		arrowIcon: {
			color: colors.text.primary,
			fontSize: 24,
			fontWeight: "700",
		},

		// Slides
		skipRow: {
			alignSelf: "flex-end",
			paddingRight: 16,
			paddingTop: 8,
		},
		slideContent: {
			flex: 1,
		},
		illustrationContainer: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
		},
		slideBottom: {
			width: "100%",
			alignItems: "center",
			paddingHorizontal: 24,
			paddingBottom: 40,
			gap: 24,
		},
		slideTitle: {
			color: colors.text.primary,
			fontSize: 26,
			fontWeight: "700",
			textAlign: "center",
			lineHeight: 36,
		},
		dots: {
			flexDirection: "row",
			gap: 8,
		},
		dot: {
			height: 8,
			borderRadius: 4,
			backgroundColor: colors.border.default,
		},
		dotActiveColor: {
			backgroundColor: colors.brand.primary,
		},
	});
}
