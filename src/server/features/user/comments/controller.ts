import { GetUserCommentsService } from "./service";
import { IAPIContextDTO } from "@/server/createContext";

const getUserCommentsController = async ({
  input,
  ctx
}: {
  input: any;
  ctx: IAPIContextDTO;
}) => {
  const comments = GetUserCommentsService({
    ...input,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.comment
    }
  });

  return comments;
};

export { getUserCommentsController };
