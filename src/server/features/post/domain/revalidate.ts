import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { DomainInput } from "@/server/createDomain";
import { PostErrorCode } from "@/shared/error/post";
import { RevalidatePostInput } from "../schema";

const domain_revalidatePost = async ({
  ctx,
  input
}: DomainInput<RevalidatePostInput & { userId: string }>) => {
  const post = await ctx.repositories.post.read(input.id);

  if (!post) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: PostErrorCode.POST_NOT_FOUND
    });
  }

  if (post.userId !== input.userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: PostErrorCode.POST_UPDATE_FORBIDDEN
    });
  }

  revalidatePath(`/post/${input.id}`);

  return post;
};

export { domain_revalidatePost };
