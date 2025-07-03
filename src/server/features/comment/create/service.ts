import { ICreateCommentDTO } from "./DTO";
import { CommentEntity } from "@/server/entities/comment/entity";

const CreateCommentService = async ({
  repositories,
  helpers,
  ...data
}: ICreateCommentDTO) => {
  const commentId = helpers.uid.generate();

  const comment = await CommentEntity.create({
    id: commentId,
    data,
    repositories
  });

  return comment;
};

export { CreateCommentService };
