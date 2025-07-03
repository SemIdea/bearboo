import { ICreatePostDTO } from "./DTO";
import { PostEntity } from "@/server/entities/post/entity";

const CreatePostService = async ({
  repositories,
  helpers,
  ...data
}: ICreatePostDTO) => {
  const postId = helpers.uid.generate();

  const post = await PostEntity.create({
    id: postId,
    data,
    repositories
  });

  return post;
};

export { CreatePostService };
