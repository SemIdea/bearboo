import { DomainInput } from "@/server/createDomain";

type Input = DomainInput;

const ReadRecentPostsService = async ({ ctx }: Input) => {
  const posts = await ctx.repositories.post.readRecents(30);

  return posts;
};

export { ReadRecentPostsService };
