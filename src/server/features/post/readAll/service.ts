import { IreadAllPostsDTO } from "./DTO";
import { PostEntity } from "@/server/entities/post/entity";

const readAllPostsService = async ({ repositories }: IreadAllPostsDTO) => {
  const posts = await PostEntity.readAll({
    repositories
  });

  return posts;
};

export { readAllPostsService };
