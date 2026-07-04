const featureFlags = {
  enableComments: true
} as const;

type FeatureFlagKey = keyof typeof featureFlags;

export { featureFlags };
export type { FeatureFlagKey };
