import { ICreateCommentDTO } from "./create.dto";

const CreateCommentService = async ({
  repositories,
  helpers,
  ...data
}: ICreateCommentDTO) => {
  const commentId = helpers.uid.generate();

  const comment = await repositories.database.create(commentId, data);

  return comment;
};

export { CreateCommentService };
