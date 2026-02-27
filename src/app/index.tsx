import { Redirect } from "expo-router";

import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks";

// Entry point:
// - DEV mode  → always go to /component-review for UI development
// - PROD mode → redirect based on auth state
export default function Index() {
	const { isAuthenticated, isLoading } = useAuth();

	if (__DEV__) {
		return <Redirect href="/component-review" />;
	}

	if (isLoading) return null;

	return <Redirect href={isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN} />;
}
