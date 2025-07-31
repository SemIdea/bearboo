import { IEntityDatabaseRepository } from "../base/entity";

type IResetTokenEntity = {
  id: string;
  token: string;
  expiresAt: Date;
  userId: string;
  used: boolean;
};

type IResetTokenModel = IEntityDatabaseRepository<
  IResetTokenEntity,
  {
    readByToken: (token: string) => Promise<IResetTokenEntity | null>;
  }
>;

type IReadResetTokenByTokenDTO = {
  token: string;
  repositories: {
    database: IResetTokenModel;
  };
};

export type { IResetTokenEntity, IResetTokenModel, IReadResetTokenByTokenDTO };
