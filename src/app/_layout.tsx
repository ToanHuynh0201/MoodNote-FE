import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useThemeContext } from "@/hooks";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider as RNThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
	initialRouteName: "(auth)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded, error] = useFonts({
		SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
		...FontAwesome.font,
	});

	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
		if (loaded) SplashScreen.hideAsync();
	}, [loaded]);

	if (!loaded) return null;

	return <RootLayoutNav />;
}

function RootLayoutNav() {
	return (
		<AuthProvider>
			<ThemeProvider>
				<NavigationThemeWrapper />
			</ThemeProvider>
		</AuthProvider>
	);
}

// Reads colorScheme from ThemeContext and bridges it to React Navigation's
// ThemeProvider so the navigation chrome (headers, tab bar) stays in sync.
function NavigationThemeWrapper() {
	const { colorScheme } = useThemeContext();

	return (
		<RNThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(auth)" />
				<Stack.Screen name="(app)" />
			</Stack>
		</RNThemeProvider>
	);
}
