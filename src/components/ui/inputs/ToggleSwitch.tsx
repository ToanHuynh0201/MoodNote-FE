import { useMemo } from "react";
import { Platform, StyleSheet, Switch, Text, View } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import type { ToggleSwitchProps } from "@/types";

export function ToggleSwitch({
	value,
	onValueChange,
	label,
	sublabel,
	disabled,
}: ToggleSwitchProps) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const trackColor = useMemo(
		() => ({
			false: colors.interactive.disabledBackground,
			true: colors.brand.primary,
		}),
		[colors],
	);

	const thumbColor = Platform.OS === "android"
		? value ? colors.brand.primary : colors.text.muted
		: undefined;

	return (
		<View style={[styles.row, disabled === true && styles.disabled]}>
			{(label != null || sublabel != null) && (
				<View style={styles.labelGroup}>
					{label != null && <Text style={styles.label}>{label}</Text>}
					{sublabel != null && <Text style={styles.sublabel}>{sublabel}</Text>}
				</View>
			)}
			<Switch
				value={value}
				onValueChange={onValueChange}
				trackColor={trackColor}
				thumbColor={thumbColor}
				disabled={disabled}
				accessibilityRole="switch"
			/>
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		row: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
		},
		labelGroup: { flex: 1, marginRight: 12 },
		label: {
			fontSize: 15,
			fontWeight: "500",
			color: colors.text.primary,
		},
		sublabel: {
			fontSize: 13,
			color: colors.text.muted,
			marginTop: 2,
		},
		disabled: { opacity: 0.5 },
	});
}
