// Semantic tokens
export { DARK_THEME } from "./dark";
export { LIGHT_THEME } from "./light";

// Responsive spacing, radii, and component sizes
export { SPACING, RADIUS, SIZE } from "./spacing";
export type { SpacingToken, RadiusToken, SizeToken } from "./spacing";

// Typography scale
export { FONT_SIZE, LINE_HEIGHT } from "./typography";
export type { FontSizeToken, LineHeightToken } from "./typography";

// Mood colors
export { MOOD_COLORS } from "./mood";
export type { MoodColors, MoodType } from "./mood";

// Types
export type { ColorScheme, ThemeColors } from "./tokens";

// NOTE: PALETTE is intentionally not exported.
// Components must never reference raw hex values directly.
// Use semantic tokens via useThemeColors() from @/hooks instead.
