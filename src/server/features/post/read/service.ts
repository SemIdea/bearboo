import { TRPCError } from "@trpc/server";
import { IReadPostDTO } from "./DTO";
import { PostEntity } from "@/server/entities/post/entity";
import { PostErrorCode } from "@/shared/error/post";

const ReadPostService = async ({ repositories, ...data }: IReadPostDTO) => {
  const post = await PostEntity.read({
    id: data.id,
    repositories: {
      ...repositories
    }
  });

  if (!post) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: PostErrorCode.POST_NOT_FOUND
    });
  }

  return post;
};

export { ReadPostService };
