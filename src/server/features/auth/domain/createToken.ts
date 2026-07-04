import { IVerifyTokenModel } from "@/server/models/verifyToken";
import { IUidGeneratorHelperAdapter } from "@/lib/uidGenerator/adapter";

type Params = {
  userId: string;
  repositories: {
    database: IVerifyTokenModel;
  };
  helpers: {
    uid: IUidGeneratorHelperAdapter;
  };
};

const CreateTokenService = async ({
  repositories,
  helpers,
  ...data
}: Params) => {
  const tokenId = helpers.uid.generate();
  const newToken = helpers.uid.generate();

  const token = await repositories.database.create(tokenId, {
    ...data,
    token: newToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    used: false
  });

  return token;
};

export { CreateTokenService };
