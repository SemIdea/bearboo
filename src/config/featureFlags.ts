const featureFlags = {
  enableSessionCaching: true,
  enablePostCaching: false,
  enableUserCaching: true,
  enableComments: true
} as const;

type FeatureFlagKey = keyof typeof featureFlags;

export { featureFlags };
export type { FeatureFlagKey };
