import {
  ICommentEntity,
  ICreateCommentDTO,
  IDeleteCommentDTO,
  IFindAllByPostIdDTO,
  IFindAllByUserIdDTO,
  IFindCommentByIdDTO,
  IUpdateCommentDTO
} from "./DTO";

class CommentEntity implements ICommentEntity {
  constructor(
    public id: string,
    public postId: string,
    public userId: string,
    public content: string
  ) {}

  static async create({ id, data, repositories }: ICreateCommentDTO) {
    const { userId, postId, content } = data;
    const newComment = new CommentEntity(id, postId, userId, content);

    const comment = await repositories.database.create(id, newComment);

    return comment;
  }

  static async find({ id, repositories }: IFindCommentByIdDTO) {
    const comment = await repositories.database.find(id);

    if (!comment) {
      return null;
    }

    return comment;
  }

  static async findAllByPostId({ postId, repositories }: IFindAllByPostIdDTO) {
    const comments = await repositories.database.findAllByPostId(postId);

    if (!comments) {
      return [] as CommentEntity[];
    }

    return comments;
  }

  static async findAllByUserId({ userId, repositories }: IFindAllByUserIdDTO) {
    const comments = await repositories.database.findAllByUserId(userId);

    if (!comments) {
      return [] as CommentEntity[];
    }

    return comments;
  }

  static async update({ id, data, repositories }: IUpdateCommentDTO) {
    const comment = await repositories.database.update(id, data);

    return comment;
  }

  static async delete({ id, repositories }: IDeleteCommentDTO) {
    return await repositories.database.delete(id);
  }
}

export { CommentEntity };
