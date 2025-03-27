import {
  ICreatePostDTO,
  IDeletePostDTO,
  IFindAllPostsDTO,
  IFindPostDTO,
  IFindUserPostsDTO,
  IPostEntity,
  IUpdatePostDTO,
} from "./DTO";

class PostEntity implements IPostEntity {
  constructor(
    public id: string,
    public userId: string,
    public title: string,
    public content: string
  ) {}

  static async create({ id, data, repositories }: ICreatePostDTO) {
    const { userId, title, content } = data;
    const newPost = new PostEntity(id, userId, title, content);

    const post = await repositories.database.create(id, newPost);

    return post;
  }

  static async find({ id, repositories }: IFindPostDTO) {
    const post = await repositories.database.find(id);

    if (!post) {
      return null;
    }

    return new PostEntity(post.id, post.userId, post.title, post.content);
  }

  static async findAll({ repositories }: IFindAllPostsDTO) {
    const postsData = await repositories.database.findAll();

    if (!postsData) {
      return null;
    }

    const posts = postsData.map(
      (post: any) =>
        new PostEntity(post.id, post.userId, post.title, post.content)
    );

    return posts;
  }

  static async findUserPosts({ userId, repositories }: IFindUserPostsDTO) {
    const postsData = await repositories.database.findUserPosts(userId);

    if (!postsData) {
      return null;
    }

    const posts = postsData.map(
      (post: any) =>
        new PostEntity(post.id, post.userId, post.title, post.content)
    );

    return posts;
  }

  static async update({ id, data, repositories }: IUpdatePostDTO) {
    return await repositories.database.update(id, data);
  }

  static async delete({ id, repositories }: IDeletePostDTO) {
    return await repositories.database.delete(id);
  }
}

export { PostEntity };
