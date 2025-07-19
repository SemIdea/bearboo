import { BaseEntity } from "../base/entity";
import {
  ICommentEntity,
  IReadAllByPostIdDTO,
  IReadAllByUserIdDTO
} from "./DTO";

type ICommentRepositories = {
  readAllByPostId: (postId: string) => Promise<ICommentEntity[] | null>;
  readAllByUserId: (userId: string) => Promise<ICommentEntity[] | null>;
};

class CommentEntityClass extends BaseEntity<
  ICommentEntity,
  ICommentRepositories
> {
  async readAllByPostId({ postId, repositories }: IReadAllByPostIdDTO) {
    const comments = await repositories.database.readAllByPostId(postId);

    if (!comments) {
      return [] as ICommentEntity[];
    }

    return comments;
  }

  async readAllByUserId({ userId, repositories }: IReadAllByUserIdDTO) {
    const comments = await repositories.database.readAllByUserId(userId);

    if (!comments) {
      return [] as ICommentEntity[];
    }

    return comments;
  }
}

const CommentEntity = new CommentEntityClass({});

export { CommentEntity };
