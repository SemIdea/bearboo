import { DomainInput } from "@/server/createDomain";
import { ReadAllCommentsByPostInput } from "../schema";

const domain_readAllCommentsByPost = async ({
  ctx,
  input
}: DomainInput<ReadAllCommentsByPostInput>) => {
  const comments = await ctx.repositories.comment.readAllByPostId(
    input.postId
  );

  return comments ?? [];
};

export { domain_readAllCommentsByPost };
