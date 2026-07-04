import { ICreatePostDTO } from "./create.dto";

const CreatePostService = async ({
  repositories,
  helpers,
  ...data
}: ICreatePostDTO) => {
  const postId = helpers.uid.generate();

  const post = await repositories.database.create(postId, data);

  return post;
};

export { CreatePostService };
