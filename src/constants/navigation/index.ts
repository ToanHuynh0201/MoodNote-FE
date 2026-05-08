import type { Ionicons } from "@expo/vector-icons";

import { s, vs } from "@/utils/responsive";

export type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export interface TabIconConfig {
	active: IoniconName;
	inactive: IoniconName;
}

export const FAB_SIZE = s(58);
export const BAR_HEIGHT = vs(64);
export const NOTCH_W = FAB_SIZE; // same width as FAB for organic connection
export const NOTCH_H = vs(18); // taller for a more visible stem
// Bottom edge of the popup (notch tip) aligns with the FAB top edge
export const POPUP_BOTTOM = BAR_HEIGHT + FAB_SIZE / 2 + vs(2);

export const TAB_ICONS: Record<string, TabIconConfig> = {
	index: { active: "home", inactive: "home-outline" },
	journal: { active: "book", inactive: "book-outline" },
	statistics: { active: "bar-chart", inactive: "bar-chart-outline" },
	profile: { active: "person", inactive: "person-outline" },
};
