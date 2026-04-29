// FR-06, FR-09: Journal list screen

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { memo, useCallback, useMemo } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import ReanimatedSwipeable, {
	type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
	Extrapolation,
	interpolate,
	useAnimatedReaction,
	useAnimatedStyle,
	type SharedValue,
} from "react-native-reanimated";

import { EntryCard, JournalListSkeleton } from "@/components/journal";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { JournalIllustration } from "@/components/ui/illustrations/JournalIllustration";
import { ROUTES, SWIPE_DELETE_ACTION_WIDTH, SWIPE_DELETE_AUTO_DRAG_THRESHOLD } from "@/constants";
import { useEntries, useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { EntryListItem } from "@/types/entry.types";
import { getDateSectionLabel, s, vs } from "@/utils";

type SectionHeaderItem = { type: "section"; id: string; title: string };
type ListRow = EntryListItem | SectionHeaderItem;

function isSectionHeader(item: ListRow): item is SectionHeaderItem {
	return "type" in item && item.type === "section";
}

interface SwipeDeleteActionProps {
	progress: SharedValue<number>;
	drag: SharedValue<number>;
	swipeable: SwipeableMethods;
	onPress: () => void;
	onAutoDelete: () => void;
}

function SwipeDeleteAction({ drag, swipeable, onPress, onAutoDelete }: SwipeDeleteActionProps) {
	const colors = useThemeColors();

	// Fire auto-delete exactly once when drag crosses the threshold
	useAnimatedReaction(
		() => drag.value,
		(current, previous) => {
			if (
				previous !== null &&
				current < SWIPE_DELETE_AUTO_DRAG_THRESHOLD &&
				previous >= SWIPE_DELETE_AUTO_DRAG_THRESHOLD
			) {
				swipeable.close();
				onAutoDelete();
			}
		},
	);

	// Scale trash icon up as user drags past the action panel width
	const iconStyle = useAnimatedStyle(() => {
		const scale = interpolate(
			drag.value,
			[-SWIPE_DELETE_ACTION_WIDTH, SWIPE_DELETE_AUTO_DRAG_THRESHOLD],
			[1, 1.3],
			Extrapolation.CLAMP,
		);
		return { transform: [{ scale }] };
	});

	// Background width expands as user drags further
	const containerStyle = useAnimatedStyle(() => {
		const width = interpolate(
			drag.value,
			[SWIPE_DELETE_AUTO_DRAG_THRESHOLD, -SWIPE_DELETE_ACTION_WIDTH, 0],
			[SWIPE_DELETE_ACTION_WIDTH * 1.5, SWIPE_DELETE_ACTION_WIDTH, SWIPE_DELETE_ACTION_WIDTH],
			Extrapolation.CLAMP,
		);
		return { width };
	});

	return (
		<Animated.View
			style={[swipeStyles.action, { backgroundColor: colors.status.error }, containerStyle]}>
			<Pressable
				style={swipeStyles.pressable}
				onPress={onPress}
				accessibilityLabel="Xoá nhật ký"
				accessibilityRole="button">
				<Animated.View style={iconStyle}>
					<Ionicons name="trash-outline" size={s(22)} color={colors.text.inverse} />
				</Animated.View>
			</Pressable>
		</Animated.View>
	);
}

const swipeStyles = StyleSheet.create({
	action: {
		height: "100%",
		borderRadius: RADIUS.lg,
		overflow: "hidden",
	},
	pressable: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});

interface EntryRowProps {
	item: EntryListItem;
	onDelete: (item: EntryListItem) => void;
}

const EntryRow = memo(function EntryRow({ item, onDelete }: EntryRowProps) {
	const handlePress = useCallback(() => {
		router.push(ROUTES.JOURNAL_DETAIL(item.id));
	}, [item.id]);

	return (
		<View>
			<ReanimatedSwipeable
				renderRightActions={(progress, drag, swipeable) => (
					<SwipeDeleteAction
						progress={progress}
						drag={drag}
						swipeable={swipeable}
						onPress={() => onDelete(item)}
						onAutoDelete={() => onDelete(item)}
					/>
				)}
				rightThreshold={SWIPE_DELETE_ACTION_WIDTH * 0.8}
				overshootFriction={6}
				friction={1.5}>
				<EntryCard entry={item} onPress={handlePress} />
			</ReanimatedSwipeable>
		</View>
	);
});

export default function JournalScreen() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { entries, isLoading, isRefreshing, loadMore, refresh, removeEntry } = useEntries();

	const sectionedData = useMemo<ListRow[]>(() => {
		const rows: ListRow[] = [];
		let currentLabel: string | null = null;
		for (const entry of entries) {
			const label = getDateSectionLabel(entry.entryDate);
			if (label !== currentLabel) {
				rows.push({ type: "section", id: `section-${label}`, title: label });
				currentLabel = label;
			}
			rows.push(entry);
		}
		return rows;
	}, [entries]);

	const handleDelete = useCallback(
		(item: EntryListItem) => {
			Alert.alert("Xoá nhật ký", "Bạn có chắc muốn xoá nhật ký này? Thao tác không thể hoàn tác.", [
				{ text: "Huỷ", style: "cancel" },
				{
					text: "Xoá",
					style: "destructive",
					onPress: () => void removeEntry(item.id),
				},
			]);
		},
		[removeEntry],
	);

	const renderItem = useCallback(
		({ item }: { item: ListRow }) => {
			if (isSectionHeader(item)) {
				return <Text style={styles.sectionHeader}>{item.title}</Text>;
			}
			return <EntryRow item={item} onDelete={handleDelete} />;
		},
		[handleDelete, styles],
	);

	const ListEmpty = useCallback(
		() => (
			<EmptyState
				icon={<JournalIllustration />}
				title="Chưa có nhật ký nào"
				subtitle="Hãy viết nhật ký đầu tiên của bạn!"
				action={{
					label: "Viết nhật ký",
					onPress: () => router.push(ROUTES.JOURNAL_CREATE),
				}}
			/>
		),
		[],
	);

	return (
		<ScreenWrapper padded={false}>
			<View style={styles.flex}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.headerTitle}>Nhật ký</Text>
					<Pressable
						onPress={() => router.push(ROUTES.JOURNAL_CREATE)}
						style={styles.addButton}
						accessibilityLabel="Viết nhật ký mới"
						accessibilityRole="button"
						hitSlop={8}>
						<Ionicons name="add" size={s(26)} color={colors.brand.primary} />
					</Pressable>
				</View>

				{/* List */}
				<FlatList
					data={sectionedData}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
					ListEmptyComponent={isLoading ? JournalListSkeleton : ListEmpty}
					onRefresh={refresh}
					refreshing={isRefreshing}
					onEndReached={loadMore}
					onEndReachedThreshold={0.4}
					initialNumToRender={8}
					maxToRenderPerBatch={5}
					windowSize={5}
					removeClippedSubviews={true}
					contentContainerStyle={[
						styles.listContent,
						entries.length === 0 && !isLoading && styles.listContentEmpty,
					]}
					showsVerticalScrollIndicator={false}
				/>
			</View>
		</ScreenWrapper>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		flex: {
			flex: 1,
		},
		header: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			paddingHorizontal: SPACING[20],
			paddingVertical: SPACING[12],
		},
		headerTitle: {
			fontSize: FONT_SIZE[22],
			fontWeight: "700",
			color: colors.text.primary,
			lineHeight: LINE_HEIGHT.loose,
		},
		addButton: {
			width: s(36),
			height: vs(36),
			justifyContent: "center",
			alignItems: "center",
			borderRadius: RADIUS.full,
			backgroundColor: colors.brand.surface,
		},
		listContent: {
			paddingHorizontal: SPACING[16],
			paddingBottom: vs(100),
			gap: SPACING[12],
		},
		listContentEmpty: {
			flex: 1,
		},
		sectionHeader: {
			fontSize: FONT_SIZE[13],
			fontWeight: "600",
			color: colors.text.muted,
			paddingTop: SPACING[4],
			letterSpacing: 0.3,
		},
	});
}
