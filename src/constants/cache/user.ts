const UserCacheTTL = 60 * 15;
const userCacheKey = (id: string) => `user:${id}`;
const userEmailCacheKey = (email: string) => `user:email:${email}`;
const userPostsCacheKey = (userId: string) => `user:${userId}:posts`;

export { UserCacheTTL, userCacheKey, userEmailCacheKey, userPostsCacheKey };
