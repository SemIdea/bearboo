import { UserEntity } from "@/server/entities/user/entity";
import { IUpdatePostDTO } from "./DTO";
import { TRPCError } from "@trpc/server";
import { AuthErrorCode } from "@/shared/error/auth";
import { PostEntity } from "@/server/entities/post/entity";

const UpdatePostService = async ({ repositories, ...data }: IUpdatePostDTO) => {
  const user = await UserEntity.find({
    id: data.userId,
    repositories: {
      ...repositories,
      database: repositories.user,
    },
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: AuthErrorCode.USER_NOT_FOUD,
    });
  }

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

  // Fix Error Message
  if (post.userId !== user.id) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You can't update this post",
    });
  }

  const newPost = await PostEntity.update({
    id: data.postId,
    data: {
      title: data.title,
      content: data.content,
    },
    repositories,
  });
};

export { UpdatePostService };
