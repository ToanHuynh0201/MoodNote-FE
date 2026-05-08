import { userService } from "@/services";
import { logError } from "@/utils/error";
import { useCallback, useEffect, useState } from "react";

export function useUserSettings() {
	const [allowTrainingData, setAllowTrainingData] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		const load = async () => {
			setIsLoading(true);
			const result = await userService.getSettings();
			if (result.success) {
				setAllowTrainingData(result.data.settings.allowTrainingData ?? false);
			} else {
				logError(result.error, { context: "useUserSettings.load" });
			}
			setIsLoading(false);
		};
		void load();
	}, []);

	const updateAllowTrainingData = useCallback(async (value: boolean) => {
		setIsSaving(true);
		const result = await userService.updateSettings({ allowTrainingData: value });
		if (result.success) {
			setAllowTrainingData(result.data.settings.allowTrainingData);
		} else {
			logError(result.error, { context: "useUserSettings.updateAllowTrainingData" });
		}
		setIsSaving(false);
	}, []);

	return { allowTrainingData, isLoading, isSaving, updateAllowTrainingData };
}
