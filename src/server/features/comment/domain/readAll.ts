import { DomainInput } from "@/server/createDomain";
import { ReadAllCommentsByPostInput } from "../schema";

type Input = DomainInput<ReadAllCommentsByPostInput>;

const ReadAllCommentsByPostService = async ({ ctx, postId }: Input) => {
  const comments = await ctx.repositories.comment.readAllByPostId(postId);

  return comments ?? [];
};

export { ReadAllCommentsByPostService };
