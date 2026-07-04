import { DomainInput } from "@/server/createDomain";
import { CreatePostInput } from "../schema";

type Input = DomainInput<CreatePostInput & { userId: string }>;

const CreatePostService = async ({ ctx, ...data }: Input) => {
  const postId = ctx.helpers.uid.generate();

  const post = await ctx.repositories.post.create(postId, data);

  return post;
};

export { CreatePostService };
