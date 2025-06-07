import { featureFlags, FeatureFlagKey } from "@/config/featureFlags";

export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  return featureFlags[flag];
}
