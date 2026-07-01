import { VerifyTokenEntity } from "@/server/entities/verifyToken/entity";
import { ICreateTokenServiceDTO } from "./createToken.dto";

const CreateTokenService = async ({
  repositories,
  helpers,
  ...data
}: ICreateTokenServiceDTO) => {
  const tokenId = helpers.uid.generate();
  const newToken = helpers.uid.generate();

  const token = await VerifyTokenEntity.create({
    id: tokenId,
    data: {
      ...data,
      token: newToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      used: false
    },
    repositories
  });

  return token;
};

export { CreateTokenService };
