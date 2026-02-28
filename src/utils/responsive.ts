import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/** Design baseline width — all Figma measurements done at this width. */
const BASE_WIDTH = 375;

/** Horizontal scale factor. < 1 on narrow phones, > 1 on wider phones. */
const SCALE = SCREEN_WIDTH / BASE_WIDTH;

/**
 * Horizontal scale.
 * Use for: paddingHorizontal, marginHorizontal, width, borderRadius, gap, icon size.
 *
 * @example s(16) → 16 on 375px, ~17.6 on 414px, ~13.6 on 320px
 */
export function s(size: number): number {
	return Math.round(PixelRatio.roundToNearestPixel(size * SCALE));
}

/**
 * Vertical scale.
 * Use for: height, minHeight, paddingVertical, marginVertical.
 *
 * Uses width-based scale capped at 1.15 — prevents excessive height growth
 * between iPhone SE (667pt) and Pro Max (932pt) on a phone-only app.
 *
 * @example vs(44) → 44 on 375px, ~46 on 414px, ~38 on 320px
 */
export function vs(size: number): number {
	const factor = Math.min(SCALE, 1.15);
	return Math.round(PixelRatio.roundToNearestPixel(size * factor));
}

/**
 * Moderate scale — grows less aggressively than s().
 * Use for values that should scale but not fully proportionally.
 *
 * Formula: size + (s(size) - size) * factor
 * @param factor - 0 = no scale, 1 = full scale. Default 0.5.
 *
 * @example ms(32, 0.5) → 32 on 375px, ~33.5 on 414px
 */
export function ms(size: number, factor = 0.5): number {
	return Math.round(PixelRatio.roundToNearestPixel(size + (s(size) - size) * factor));
}

/** Exported screen dimensions for layout calculations. */
export const SCREEN = {
	WIDTH: SCREEN_WIDTH,
	HEIGHT: SCREEN_HEIGHT,
} as const;
