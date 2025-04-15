const PostCacheTTL = 60 * 15;

const postCacheKey = (id: string) => `post:${id}`;
const userPostsCacheKey = (userId: string) => `user:${userId}:posts`;
const newestPostsCacheKey = (limit: number) => `posts:newest:${limit}`;

export { PostCacheTTL, postCacheKey, userPostsCacheKey, newestPostsCacheKey };
