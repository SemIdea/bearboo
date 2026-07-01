import { IProtectedAPIContextDTO } from "@/server/createContext";

const readUserFromSessionController = async ({
  ctx
}: {
  ctx: IProtectedAPIContextDTO;
}) => {
  return ctx.user;
};

export { readUserFromSessionController };
