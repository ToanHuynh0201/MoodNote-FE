/**
 * Spacing tokens — named spacing, radius, and size constants for MoodNote.
 *
 * SPACING keys are raw px design values, so migration is explicit:
 *   paddingHorizontal: 16  →  paddingHorizontal: SPACING[16]
 *
 * For values not covered (e.g. 7, 15), call s() / vs() inline.
 */

import { s, vs } from "../utils/responsive";

// ── Spacing ───────────────────────────────────────────────────────────────────

export const SPACING = {
	2: s(2),
	4: s(4),
	6: s(6),
	8: s(8),
	10: s(10),
	12: s(12),
	14: s(14),
	16: s(16),
	20: s(20),
	24: s(24),
	28: s(28),
	32: s(32),
	48: vs(48), // vertical — e.g. empty state paddingVertical
} as const;

export type SpacingToken = keyof typeof SPACING;

// ── Border radius ─────────────────────────────────────────────────────────────

export const RADIUS = {
	sm: s(8), // Button, Input, TextArea, SegmentedControl
	md: s(10), // SearchBar
	lg: s(12), // Card, Toast
	xl: s(20), // Modal top corners
	full: 999, // Badge, IconButton, Avatar (fully circular)
} as const;

export type RadiusToken = keyof typeof RADIUS;

// ── Dimension scale ───────────────────────────────────────────────────────────
// Abstract size scale — not tied to any specific component.
// Components map their variants to this scale.
//
// Values outside the scale → use s() / vs() inline in the component:
//   textAreaMinH = vs(120), progressBarH = vs(6), statusDot = s(8)

export const SIZE = {
	xs:    s(32),  // small: iconButtonSm, avatarSm, buttonSm height
	sm:    s(40),  // iconButtonMd
	md:    s(44),  // standard touch target: avatarMd, buttonMd height, inputHeight
	lg:    s(48),  // iconButtonLg
	xl:    s(52),  // large: buttonLg height
	"2xl": s(64),  // extra-large: avatarLg
} as const;

export type SizeToken = keyof typeof SIZE;
