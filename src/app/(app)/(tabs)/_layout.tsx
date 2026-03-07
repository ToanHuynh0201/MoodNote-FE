import { Tabs } from "expo-router";

import { TabBar } from "@/components/navigation";

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{ headerShown: false }}
			tabBar={(props) => <TabBar {...props} />}>
			<Tabs.Screen name="index" options={{ title: "Home" }} />
			<Tabs.Screen name="journal" options={{ title: "Nhật ký" }} />
			<Tabs.Screen name="statistics" options={{ title: "Thống kê" }} />
			<Tabs.Screen name="profile" options={{ title: "Hồ sơ" }} />
		</Tabs>
	);
}
