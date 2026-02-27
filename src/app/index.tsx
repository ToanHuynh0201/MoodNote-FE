import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks";
import { Redirect } from "expo-router";
import { useState } from "react";

// Entry point:
// - MOCK_MODE → check onboarding, then redirect based on auth state (bỏ qua API)
// - PROD mode → check onboarding, then redirect based on auth state
export default function Index() {
	const { isAuthenticated, isLoading } = useAuth();
	const [onboardingChecked, setOnboardingChecked] = useState(false);
	const [onboardingDone, setOnboardingDone] = useState(false);

	// useEffect(() => {
	// 	getStorageItem<string>(ONBOARDING_COMPLETED_KEY).then((value) => {
	// 		setOnboardingDone(value === "true");
	// 		setOnboardingChecked(true);
	// 	});
	// }, []);

	// if (__DEV__) {
	// 	return <Redirect href="/component-review" />;
	// }

	if (isLoading || !onboardingChecked) return null;

	if (!onboardingDone) {
		return <Redirect href={ROUTES.ONBOARDING} />;
	}

	return <Redirect href={isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN} />;
}
