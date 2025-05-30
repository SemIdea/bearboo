import { PostEntity } from "@/server/entities/post/entity";
import { IFindAllPostsDTO } from "./DTO";

const FindAllPostsService = async ({ repositories }: IFindAllPostsDTO) => {
  const posts = await PostEntity.findAll({
    repositories,
  });

  return posts;
};

export { FindAllPostsService };
