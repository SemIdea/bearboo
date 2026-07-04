import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { IPostModel } from "@/server/models/post";
import { PostErrorCode } from "@/shared/error/post";
import { RevalidatePostInput } from "../schema";

type Params = RevalidatePostInput & {
  userId: string;
  repositories: {
    database: IPostModel;
  };
};

const RevalidatePostService = async ({ repositories, ...data }: Params) => {
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
      message: PostErrorCode.POST_UPDATE_FORBIDDEN
    });
  }

  revalidatePath(`/post/${data.id}`);

  return post;
};

export { RevalidatePostService };
