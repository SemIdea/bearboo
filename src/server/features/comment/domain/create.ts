import { DomainInput } from "@/server/createDomain";
import { CreateCommentInput } from "../schema";

type Input = DomainInput<CreateCommentInput & { userId: string }>;

const CreateCommentService = async ({ ctx, ...data }: Input) => {
  const commentId = ctx.helpers.uid.generate();

  const comment = await ctx.repositories.comment.create(commentId, data);

  return comment;
};

export { CreateCommentService };
