import { PostEntity } from "@/server/entities/post/entity";
import { IFindPostDTO } from "./DTO";
import { TRPCError } from "@trpc/server";
import { AuthErrorCode } from "@/shared/error/auth";

const ReadPostService = async ({ repositories, ...data }: IFindPostDTO) => {
  const post = await PostEntity.find({
    id: data.postId,
    repositories: {
      ...repositories,
    },
  });

  if (!post) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: AuthErrorCode.POST_NOT_FOUND,
    });
  }

  return post;
};

export { ReadPostService };
