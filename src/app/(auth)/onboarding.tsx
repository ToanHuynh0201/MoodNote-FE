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
import { useCallback, useMemo, useState, type ComponentType } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

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
					<Image
						source={require("../../../assets/images/splash-icon.png")}
						style={styles.splashLogo}
						resizeMode="contain"
					/>
					<Text style={styles.splashTitle}>MoodNote</Text>
					<Text style={styles.splashSubtitle}>
						{"Mọi thứ trở nên ổn áo, hãy ở đây một chút,\ncùng âm nhạc và sự lắng nghe."}
					</Text>
				</View>

				<View style={styles.splashFooter}>
					{/* Custom 64px circular gradient CTA — không có component tương đương */}
					<Pressable
						style={styles.arrowButton}
						onPress={() => setStep(1)}
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

			{/* Illustration */}
			<View style={styles.illustrationContainer}>
				<Illustration />
			</View>

			{/* Bottom content */}
			<View style={styles.slideBottom}>
				<Text style={styles.slideTitle}>{slide.title}</Text>

				{/* Dots */}
				<View style={styles.dots}>
					{SLIDES.map((_, i) => (
						<View
							key={i}
							style={[styles.dot, i === slideIndex && styles.dotActive]}
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
			width: 8,
			height: 8,
			borderRadius: 4,
			backgroundColor: colors.border.default,
		},
		dotActive: {
			backgroundColor: colors.brand.primary,
			width: 20,
		},
	});
}
