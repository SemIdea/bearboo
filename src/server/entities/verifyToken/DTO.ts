import { IEntityDatabaseRepository } from "../base/entity";

type IVerifyTokenEntity = {
  id: string;
  token: string;
  expiresAt: Date;
  userId: string;
  used: boolean;
};

type IVerifyTokenModel = IEntityDatabaseRepository<
  IVerifyTokenEntity,
  {
    readByToken: (token: string) => Promise<IVerifyTokenEntity | null>;
  }
>;

type IReadVerifyTokenByTokenDTO = {
  token: string;
  repositories: {
    database: IVerifyTokenModel;
  };
};

export type {
  IVerifyTokenEntity,
  IVerifyTokenModel,
  IReadVerifyTokenByTokenDTO
};
