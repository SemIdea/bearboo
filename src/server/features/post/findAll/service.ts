import { IFindAllPostsDTO } from "./DTO";

const FindAllPostsService = async ({ repositories }: IFindAllPostsDTO) => {
  const posts = await repositories.database.findAll();

  return posts;
};

export { FindAllPostsService };
