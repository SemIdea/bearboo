import { ICreatePostDTO, IPostEntity } from "./DTO";

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
}

export { PostEntity };
