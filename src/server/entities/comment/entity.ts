import { ICommentEntity, ICreateCommentDTO, IFindAllByPostIdDTO } from "./DTO";

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

  static async findAllByPostId({ postId, repositories }: IFindAllByPostIdDTO) {
    const commentsData = await repositories.database.findAllByPostId(postId);

    if (!commentsData) {
      return [] as CommentEntity[];
    }

    const comments = commentsData.map(
      (comment) =>
        new CommentEntity(
          comment.id,
          comment.postId,
          comment.userId,
          comment.content
        )
    );

    return comments;
  }
}

export { CommentEntity };
