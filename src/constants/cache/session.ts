const SessionCacheTTL = 60 * 15;

const sessionCacheKey = (id: string) => `session:${id}`;
const sessionAccessTokenCacheKey = (accessToken: string) =>
  `session:accessToken:${accessToken}`;
const sessionRefreshTokenCacheKey = (refreshToken: string) =>
  `session:refreshToken:${refreshToken}`;

export {
  SessionCacheTTL,
  sessionCacheKey,
  sessionAccessTokenCacheKey,
  sessionRefreshTokenCacheKey
};
