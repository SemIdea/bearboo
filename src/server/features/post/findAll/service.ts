import { IFindAllPostsDTO } from "./DTO";
import { PostEntity } from "@/server/entities/post/entity";

const FindAllPostsService = async ({ repositories }: IFindAllPostsDTO) => {
  const posts = await PostEntity.findAll({
    repositories
  });

  return posts;
};

export { FindAllPostsService };
