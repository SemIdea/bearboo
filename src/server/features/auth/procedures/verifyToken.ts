import { IAPIContextDTO } from "@/server/createContext";
import { VerifyTokenInput } from "../schema";
import { VerifyTokenService } from "../domain/verifyToken";

const verifyTokenController = async ({
  input,
  ctx
}: {
  input: VerifyTokenInput;
  ctx: IAPIContextDTO;
}) => {
  const token = await VerifyTokenService({
    ...input,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.verifyToken
    }
  });

  return token;
};

export { verifyTokenController };
