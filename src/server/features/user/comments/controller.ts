import { ReadUserCommentsInput } from "@/server/schema/user.schema";
import { ReadUserCommentsService } from "./service";
import { IAPIContextDTO } from "@/server/createContext";

const readUserCommentsController = async ({
  input,
  ctx
}: {
  input: ReadUserCommentsInput;
  ctx: IAPIContextDTO;
}) => {
  const comments = ReadUserCommentsService({
    ...input,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.comment
    }
  });

  return comments;
};

export { readUserCommentsController };
