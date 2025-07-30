import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { IRevalidatePostDTO } from "./DTO";
import { PostEntity } from "@/server/entities/post/entity";
import { PostErrorCode } from "@/shared/error/post";

const RevalidatePostService = async ({
  repositories,
  ...data
}: IRevalidatePostDTO) => {
  const post = await PostEntity.read({
    ...data,
    repositories
  });

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
