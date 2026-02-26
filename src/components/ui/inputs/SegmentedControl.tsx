import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import type { SegmentedControlProps } from "@/types";

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={styles.container}>
			{options.map((option) => {
				const isActive = option.value === value;
				return (
					<Pressable
						key={option.value}
						style={[styles.segment, isActive && styles.segmentActive]}
						onPress={() => onChange(option.value)}
						accessibilityRole="button"
						accessibilityState={{ selected: isActive }}>
						<Text style={[styles.label, isActive && styles.labelActive]}>
							{option.label}
						</Text>
					</Pressable>
				);
			})}
		</ScrollView>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		container: {
			flexDirection: "row",
			gap: 6,
			paddingHorizontal: 2,
			paddingVertical: 2,
		},
		segment: {
			paddingVertical: 7,
			paddingHorizontal: 16,
			borderRadius: 8,
			backgroundColor: colors.background.secondary,
		},
		segmentActive: { backgroundColor: colors.brand.primary },
		label: {
			fontSize: 14,
			fontWeight: "500",
			color: colors.text.secondary,
		},
		labelActive: { color: colors.text.inverse },
	});
}
