// FR-18: Top keywords from analyzed entries

import { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { SkeletonLoader } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/display/Badge";
import { useKeywordStats, useThemeColors } from "@/hooks";
import type { ThemeColors } from "@/theme";
import { FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } from "@/theme";
import type { KeywordStat } from "@/types/stats.types";
import { s } from "@/utils";

const DEFAULT_LIMIT = 20;

export function KeywordsSection() {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const { data, isLoading, error } = useKeywordStats({ limit: DEFAULT_LIMIT });

	const maxCount = useMemo(() => {
		if (!data || data.keywords.length === 0) return 1;
		return Math.max(...data.keywords.map((k) => k.count));
	}, [data]);

	if (isLoading) {
		return (
			<View style={styles.container}>
				<SkeletonLoader width="50%" height={s(18)} borderRadius={RADIUS.full} style={styles.titleSkeleton} />
				<View style={styles.chipRow}>
					{[80, 60, 100, 70, 55, 90, 65].map((w, i) => (
						<SkeletonLoader key={i} width={s(w)} height={s(28)} borderRadius={RADIUS.full} />
					))}
				</View>
			</View>
		);
	}

	if (error != null || data == null) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Từ khóa nổi bật</Text>
				<View style={styles.emptyBox}>
					<Text style={styles.emptyText}>{error ?? "Chưa có dữ liệu."}</Text>
				</View>
			</View>
		);
	}

	if (data.keywords.length === 0) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Từ khóa nổi bật</Text>
				<View style={styles.emptyBox}>
					<Text style={styles.emptyText}>Chưa có đủ nhật ký để phân tích từ khóa.</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Từ khóa nổi bật</Text>
				<Text style={styles.subtitle}>{data.totalAnalyzed} nhật ký đã phân tích</Text>
			</View>

			<FlatList
				data={data.keywords}
				keyExtractor={(item) => item.keyword}
				renderItem={({ item }) => <KeywordRow item={item} maxCount={maxCount} />}
				scrollEnabled={false}
			/>
		</View>
	);
}

interface KeywordRowProps {
	item: KeywordStat;
	maxCount: number;
}

function KeywordRow({ item, maxCount }: KeywordRowProps) {
	const colors = useThemeColors();
	const styles = useMemo(() => createRowStyles(colors), [colors]);
	const barPercent = Math.round((item.count / maxCount) * 100);

	return (
		<View style={styles.row}>
			<Badge label={item.keyword} size="sm" />
			<View style={styles.barTrack}>
				<View style={[styles.barFill, { width: `${barPercent}%` as `${number}%` }]} />
			</View>
			<Text style={styles.count}>{item.count}</Text>
		</View>
	);
}

function createStyles(colors: ThemeColors) {
	return StyleSheet.create({
		container: {
			gap: SPACING[12],
		},
		header: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
		},
		title: {
			fontSize: FONT_SIZE[17],
			fontWeight: "700",
			color: colors.brand.primary,
			lineHeight: LINE_HEIGHT.relaxed,
		},
		subtitle: {
			fontSize: FONT_SIZE[12],
			color: colors.text.muted,
			lineHeight: LINE_HEIGHT.tight,
		},
		titleSkeleton: {
			marginBottom: SPACING[8],
		},
		chipRow: {
			flexDirection: "row",
			flexWrap: "wrap",
			gap: s(8),
		},
		emptyBox: {
			backgroundColor: colors.background.elevated,
			borderRadius: RADIUS.md,
			padding: SPACING[16],
			alignItems: "center",
		},
		emptyText: {
			fontSize: FONT_SIZE[13],
			color: colors.text.muted,
			lineHeight: LINE_HEIGHT.normal,
			textAlign: "center",
		},
	});
}

function createRowStyles(colors: ThemeColors) {
	return StyleSheet.create({
		row: {
			flexDirection: "row",
			alignItems: "center",
			gap: s(8),
			paddingVertical: SPACING[4],
		},
		barTrack: {
			flex: 1,
			height: s(6),
			backgroundColor: colors.border.subtle,
			borderRadius: RADIUS.full,
			overflow: "hidden",
		},
		barFill: {
			height: "100%",
			backgroundColor: colors.brand.primary,
			borderRadius: RADIUS.full,
			opacity: 0.7,
		},
		count: {
			fontSize: FONT_SIZE[12],
			color: colors.text.muted,
			lineHeight: LINE_HEIGHT.tight,
			width: s(24),
			textAlign: "right",
		},
	});
}
