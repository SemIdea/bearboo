export const featureFlags = {
  enableSessionCaching: true,
  enablePostCaching: false,
  enableUserCaching: true,
  enableComments: true,
} as const;

export type FeatureFlagKey = keyof typeof featureFlags;
