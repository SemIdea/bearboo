import { TRPCError } from "@trpc/server";
import { IFindPostDTO } from "./DTO";
import { PostEntity } from "@/server/entities/post/entity";
import { PostErrorCode } from "@/shared/error/post";

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
      message: PostErrorCode.POST_NOT_FOUND,
    });
  }

  return post;
};

export { ReadPostService };
