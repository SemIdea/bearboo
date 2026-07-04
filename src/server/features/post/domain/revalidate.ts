import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { DomainInput } from "@/server/createDomain";
import { PostErrorCode } from "@/shared/error/post";
import { RevalidatePostInput } from "../schema";

type Input = DomainInput<RevalidatePostInput & { userId: string }>;

const RevalidatePostService = async ({ ctx, ...data }: Input) => {
  const post = await ctx.repositories.post.read(data.id);

  if (!post) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: PostErrorCode.POST_NOT_FOUND
    });
  }

  if (post.userId !== data.userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: PostErrorCode.POST_UPDATE_FORBIDDEN
    });
  }

  revalidatePath(`/post/${data.id}`);

  return post;
};

export { RevalidatePostService };
