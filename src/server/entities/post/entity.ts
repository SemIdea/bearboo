import { BaseEntity } from "../base/entity";
import {
  IPostEntity,
  IPostModel,
  IReadAllPostsDTO,
  IReadUserPostsDTO
} from "./DTO";

class PostEntityClass extends BaseEntity<IPostEntity, IPostModel> {
  async readAll({ repositories }: IReadAllPostsDTO) {
    const posts = await repositories.database.readAll();

    return posts;
  }

  async readUserPosts({ userId, repositories }: IReadUserPostsDTO) {
    const userPosts = await repositories.database.readUserPosts(userId);

    return userPosts;
  }
}

const PostEntity = new PostEntityClass({});

export { PostEntity };
