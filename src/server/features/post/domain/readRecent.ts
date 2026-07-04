import { createDomain } from "@/server/createDomain";

const domain_readRecentPosts = createDomain(async ({ ctx }) => {
  const posts = await ctx.repositories.post.readRecents(30);

  return posts;
});

export { domain_readRecentPosts };
