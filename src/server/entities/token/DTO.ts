import { IEntityDatabaseRepository } from "../base/entity";

type ITokenEntity = {
  id: string;
  token: string;
  expiresAt: Date;
  userId: string;
  used: boolean;
};

type ITokenModel = IEntityDatabaseRepository<
  ITokenEntity,
  {
    readByToken: (token: string) => Promise<ITokenEntity | null>;
  }
>;

type IReadTokenByTokenDTO = {
  token: string;
  repositories: {
    database: ITokenModel;
  };
};

export type { ITokenEntity, ITokenModel, IReadTokenByTokenDTO };
