import { FeatureFlagKey, featureFlags } from "@/config/featureFlags";

export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
	return featureFlags[flag];
}
