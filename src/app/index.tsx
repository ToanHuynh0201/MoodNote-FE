import { ONBOARDING_COMPLETED_KEY, ROUTES } from "@/constants";
import { useAuth } from "@/hooks";
import { getStorageItem } from "@/utils";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

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

	if (isLoading || !onboardingChecked) return null;

	if (!onboardingDone) {
		return <Redirect href={ROUTES.SPLASH} />;
	}

	return <Redirect href={isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN} />;
	// return <Redirect href={"/component-review"} />;
}
