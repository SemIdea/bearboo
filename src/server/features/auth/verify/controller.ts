import { IAPIContextDTO } from "@/server/createContext";
import { VerifyTokenInput } from "@/server/schema/token.schema";
import { VerifyTokenService } from "./service";

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
