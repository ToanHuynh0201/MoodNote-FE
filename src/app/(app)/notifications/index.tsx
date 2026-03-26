// Notification list screen

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
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

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { Badge } from "@/components/ui/display/Badge";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { SkeletonLoader } from "@/components/ui/feedback/SkeletonLoader";
import { useNotifications, useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { Notification, NotificationType } from "@/types/notification.types";
import { s, vs, formatRelativeTime } from "@/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const SWIPE_ACTION_WIDTH = s(72);
const AUTO_DELETE_DRAG = -s(150);

const TYPE_ICON: Record<NotificationType, string> = {
	SYSTEM: "notifications-outline",
	REMINDER: "time-outline",
	STREAK: "flame-outline",
};

const TYPE_LABEL: Record<NotificationType, string> = {
	SYSTEM: "Hệ thống",
	REMINDER: "Nhắc nhở",
	STREAK: "Streak",
};

// ─── Swipe delete action ──────────────────────────────────────────────────────

interface SwipeDeleteActionProps {
	progress: SharedValue<number>;
	drag: SharedValue<number>;
	swipeable: SwipeableMethods;
	onPress: () => void;
	onAutoDelete: () => void;
}

function SwipeDeleteAction({ drag, swipeable, onPress, onAutoDelete }: SwipeDeleteActionProps) {
	const colors = useThemeColors();

	useAnimatedReaction(
		() => drag.value,
		(current, previous) => {
			if (previous !== null && current < AUTO_DELETE_DRAG && previous >= AUTO_DELETE_DRAG) {
				swipeable.close();
				onAutoDelete();
			}
		},
	);

	const iconStyle = useAnimatedStyle(() => {
		const scale = interpolate(
			drag.value,
			[-SWIPE_ACTION_WIDTH, AUTO_DELETE_DRAG],
			[1, 1.3],
			Extrapolation.CLAMP,
		);
		return { transform: [{ scale }] };
	});

	const containerStyle = useAnimatedStyle(() => {
		const width = interpolate(
			drag.value,
			[AUTO_DELETE_DRAG, -SWIPE_ACTION_WIDTH, 0],
			[SWIPE_ACTION_WIDTH * 1.5, SWIPE_ACTION_WIDTH, SWIPE_ACTION_WIDTH],
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
				accessibilityLabel="Xoá thông báo"
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

// ─── NotificationItem ─────────────────────────────────────────────────────────

interface NotificationItemProps {
	item: Notification;
	onMarkRead: (id: string) => void;
	onDelete: (id: string) => void;
	colors: ThemeColors;
	styles: ReturnType<typeof createStyles>;
}

function NotificationItem({ item, onMarkRead, colors, styles }: NotificationItemProps) {
	const iconName = TYPE_ICON[item.type] as React.ComponentProps<typeof Ionicons>["name"];

	return (
		<Pressable
			style={[
				styles.item,
				{ backgroundColor: item.isRead ? colors.background.card : colors.background.elevated },
			]}
			onPress={() => { if (!item.isRead) onMarkRead(item.id); }}
			accessibilityRole="button"
			accessibilityLabel={item.title}>
			{/* Unread dot */}
			{!item.isRead && <View style={styles.unreadDot} />}

			{/* Type icon */}
			<View style={styles.iconWrap}>
				<Ionicons name={iconName} size={s(20)} color={colors.iconDefault} />
			</View>

			{/* Content */}
			<View style={styles.content}>
				<Badge
					label={TYPE_LABEL[item.type]}
					color={colors.brand.surface}
					textColor={colors.brand.primary}
					size="sm"
				/>
				<Text
					style={[
						styles.itemTitle,
						{ fontWeight: item.isRead ? "500" : "700" },
					]}
					numberOfLines={1}>
					{item.title}
				</Text>
				<Text style={styles.itemMessage} numberOfLines={2}>
					{item.message}
				</Text>
				<Text style={styles.itemTime}>{formatRelativeTime(item.createdAt)}</Text>
			</View>
		</Pressable>
	);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function NotificationSkeleton() {
	return (
		<View style={skeletonStyles.container}>
			{Array.from({ length: 5 }).map((_, i) => (
				<SkeletonLoader key={i} width="100%" height={vs(72)} borderRadius={RADIUS.lg} />
			))}
		</View>
	);
}

const skeletonStyles = StyleSheet.create({
	container: { gap: SPACING[12], paddingHorizontal: SPACING[16] },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const {
		notifications,
		unreadCount,
		isLoading,
		isRefreshing,
		isLoadingMore,
		error,
		refresh,
		loadMore,
		markRead,
		markAllRead,
		deleteNotification,
	} = useNotifications();

	const handleDelete = useCallback(
		(id: string) => {
			void deleteNotification(id);
		},
		[deleteNotification],
	);

	const renderItem = useCallback(
		({ item }: { item: Notification }) => (
			<View>
				<ReanimatedSwipeable
					renderRightActions={(progress, drag, swipeable) => (
						<SwipeDeleteAction
							progress={progress}
							drag={drag}
							swipeable={swipeable}
							onPress={() => handleDelete(item.id)}
							onAutoDelete={() => handleDelete(item.id)}
						/>
					)}
					rightThreshold={SWIPE_ACTION_WIDTH * 0.8}
					overshootFriction={6}
					friction={1.5}>
					<NotificationItem
						item={item}
						onMarkRead={markRead}
						onDelete={handleDelete}
						colors={colors}
						styles={styles}
					/>
				</ReanimatedSwipeable>
			</View>
		),
		[handleDelete, markRead, colors, styles],
	);

	const ListEmpty = useCallback(
		() => (
			<EmptyState
				icon={<Ionicons name="notifications-outline" size={s(56)} color={colors.text.muted} />}
				title="Chưa có thông báo nào"
				subtitle="Các thông báo của bạn sẽ xuất hiện ở đây."
			/>
		),
		[colors],
	);

	const ListFooter = useCallback(
		() =>
			isLoadingMore ? (
				<View style={styles.footer}>
					<LoadingSpinner size="small" overlay={false} />
				</View>
			) : null,
		[isLoadingMore, styles],
	);

	return (
		<ScreenWrapper padded={false}>
			<View style={styles.flex}>
				{/* Header */}
				<View style={styles.header}>
					<Pressable
						onPress={() => router.back()}
						hitSlop={8}
						accessibilityLabel="Quay lại"
						accessibilityRole="button">
						<Ionicons name="chevron-back" size={s(26)} color={colors.text.primary} />
					</Pressable>

					<Text style={styles.headerTitle}>Thông báo</Text>

					{unreadCount > 0 ? (
						<Pressable
							onPress={() => void markAllRead()}
							hitSlop={8}
							accessibilityLabel="Đánh dấu tất cả đã đọc"
							accessibilityRole="button">
							<Text style={styles.markAllText}>Đọc tất cả</Text>
						</Pressable>
					) : (
						<View style={styles.headerSpacer} />
					)}
				</View>

				{/* Error banner */}
				{error != null && (
					<View style={styles.errorBanner}>
						<Text style={styles.errorText}>{error}</Text>
					</View>
				)}

				{/* List or skeleton */}
				{isLoading && notifications.length === 0 ? (
					<NotificationSkeleton />
				) : (
					<FlatList
						data={notifications}
						keyExtractor={(item) => item.id}
						renderItem={renderItem}
						ListEmptyComponent={isLoading ? null : ListEmpty}
						onRefresh={refresh}
						refreshing={isRefreshing}
						onEndReached={loadMore}
						onEndReachedThreshold={0.4}
						ListFooterComponent={ListFooter}
						contentContainerStyle={[
							styles.listContent,
							notifications.length === 0 && !isLoading && styles.listContentEmpty,
						]}
						showsVerticalScrollIndicator={false}
					/>
				)}
			</View>
		</ScreenWrapper>
	);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		flex: { flex: 1 },
		header: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingHorizontal: SPACING[20],
			paddingVertical: SPACING[12],
		},
		headerTitle: {
			fontSize: FONT_SIZE[18],
			fontWeight: "700",
			color: colors.text.primary,
			lineHeight: LINE_HEIGHT.relaxed,
		},
		headerSpacer: {
			width: s(60),
		},
		markAllText: {
			fontSize: FONT_SIZE[13],
			color: colors.brand.primary,
			fontWeight: "600",
		},
		listContent: {
			paddingHorizontal: SPACING[16],
			paddingBottom: vs(40),
			gap: SPACING[12],
		},
		listContentEmpty: {
			flex: 1,
		},
		footer: {
			paddingVertical: SPACING[16],
			alignItems: "center",
		},
		errorBanner: {
			marginHorizontal: SPACING[16],
			marginBottom: SPACING[8],
			backgroundColor: colors.status.errorBackground,
			borderRadius: RADIUS.md,
			paddingHorizontal: SPACING[12],
			paddingVertical: SPACING[8],
		},
		errorText: {
			fontSize: FONT_SIZE[13],
			color: colors.status.error,
		},
		// NotificationItem styles
		item: {
			flexDirection: "row",
			alignItems: "flex-start",
			gap: SPACING[12],
			borderRadius: RADIUS.lg,
			padding: SPACING[12],
		},
		unreadDot: {
			position: "absolute",
			top: SPACING[12],
			right: SPACING[12],
			width: s(8),
			height: s(8),
			borderRadius: RADIUS.full,
			backgroundColor: colors.brand.primary,
		},
		iconWrap: {
			width: s(40),
			height: s(40),
			borderRadius: RADIUS.full,
			backgroundColor: colors.brand.surface,
			justifyContent: "center",
			alignItems: "center",
			flexShrink: 0,
		},
		content: {
			flex: 1,
			gap: SPACING[4],
			paddingRight: SPACING[16],
		},
		itemTitle: {
			fontSize: FONT_SIZE[14],
			color: colors.text.primary,
		},
		itemMessage: {
			fontSize: FONT_SIZE[13],
			color: colors.text.secondary,
			lineHeight: LINE_HEIGHT.normal,
		},
		itemTime: {
			fontSize: FONT_SIZE[12],
			color: colors.text.muted,
		},
	});
}
