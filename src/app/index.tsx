import { MOCK_MODE, ONBOARDING_COMPLETED_KEY, ROUTES } from "@/constants";
import { useAuth } from "@/hooks";
import { getStorageItem } from "@/utils/storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

// Entry point:
// - MOCK_MODE → bỏ qua isLoading (không có API), check onboarding từ storage rồi redirect
// - PROD mode → chờ auth + check onboarding, sau đó redirect
export default function Index() {
	const { isAuthenticated, isLoading } = useAuth();
	const [onboardingChecked, setOnboardingChecked] = useState(false);
	const [onboardingDone, setOnboardingDone] = useState(false);

	useEffect(() => {
		getStorageItem<string>(ONBOARDING_COMPLETED_KEY).then((value) => {
			setOnboardingDone(value === "true");
			setOnboardingChecked(true);
		});
	}, []);

	// In MOCK_MODE skip isLoading (no API to wait for)
	if ((!MOCK_MODE && isLoading) || !onboardingChecked) return null;

	if (!onboardingDone) {
		return <Redirect href={ROUTES.ONBOARDING} />;
	}

	return <Redirect href={isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN} />;
}
