import { TRPCError } from "@trpc/server";
import { IDeletePostDTO } from "./delete.dto";
import { PostErrorCode } from "@/shared/error/post";

const DeletePostService = async ({ repositories, ...data }: IDeletePostDTO) => {
  const post = await repositories.database.read(data.id);

  if (!post) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: PostErrorCode.POST_NOT_FOUND
    });
  }

  if (post.userId !== data.userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: PostErrorCode.POST_DELETE_FORBIDDEN
    });
  }

  const deletedPost = await repositories.database.delete(post.id);

  return deletedPost;
};

export { DeletePostService };
