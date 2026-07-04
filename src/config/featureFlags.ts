const featureFlags = {
	enableComments: true,
} as const;

type FeatureFlagKey = keyof typeof featureFlags;

export type { FeatureFlagKey };
export { featureFlags };
