import { ICreatePostDTO } from "./DTO";
import { PostEntity } from "@/server/entities/post/entity";
import { GenerateSnowflakeUID } from "@/server/drivers/snowflake";

const CreatePostService = async ({ repositories, ...data }: ICreatePostDTO) => {
  const postId = await GenerateSnowflakeUID();

  const post = await PostEntity.create({
    id: postId,
    data: {
      userId: data.userId,
      title: data.title,
      content: data.content
    },
    repositories: {
      database: repositories.database,
      cache: repositories.cache
    }
  });

  return post;
};

export { CreatePostService };
