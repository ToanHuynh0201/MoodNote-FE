import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import type { SearchBarProps } from "@/types";

export function SearchBar({
	value,
	onChangeText,
	placeholder = "Tìm kiếm...",
	onClear,
	autoFocus,
}: SearchBarProps) {
	const colors = useThemeColors();
	const [focused, setFocused] = useState(false);
	const styles = useMemo(() => createStyles(colors), [colors]);

	const handleClear = useCallback(() => {
		onChangeText("");
		onClear?.();
	}, [onChangeText, onClear]);

	const handleFocus = useCallback(() => setFocused(true), []);
	const handleBlur = useCallback(() => setFocused(false), []);

	return (
		<View style={[styles.container, focused && styles.containerFocused]}>
			<Ionicons
				name="search"
				size={18}
				color={focused ? colors.input.borderFocused : colors.text.muted}
				style={styles.searchIcon}
			/>
			<TextInput
				style={styles.input}
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={colors.input.placeholder}
				onFocus={handleFocus}
				onBlur={handleBlur}
				autoFocus={autoFocus}
				returnKeyType="search"
			/>
			{value.length > 0 && (
				<Pressable
					onPress={handleClear}
					hitSlop={8}
					accessibilityLabel="Xoá tìm kiếm"
					accessibilityRole="button">
					<Ionicons
						name="close-circle"
						size={18}
						color={colors.text.muted}
						style={styles.clearIcon}
					/>
				</Pressable>
			)}
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		container: {
			flexDirection: "row",
			alignItems: "center",
			borderWidth: 1,
			borderColor: colors.input.border,
			borderRadius: 10,
			backgroundColor: colors.input.background,
			paddingHorizontal: 12,
			height: 44,
		},
		containerFocused: { borderColor: colors.input.borderFocused },
		searchIcon: { marginRight: 8 },
		clearIcon: { marginLeft: 8 },
		input: {
			flex: 1,
			fontSize: 15,
			color: colors.input.text,
			padding: 0,
		},
	});
}
