// Semantic tokens
export { DARK_THEME } from "./dark";
export { LIGHT_THEME } from "./light";

// Mood colors
export { MOOD_COLORS } from "./mood";
export type { MoodColors, MoodType } from "./mood";

// Types
export type { ColorScheme, ThemeColors } from "./tokens";

// NOTE: PALETTE is intentionally not exported.
// Components must never reference raw hex values directly.
// Use semantic tokens via useThemeColors() from @/hooks instead.
