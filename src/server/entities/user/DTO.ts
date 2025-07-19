import { IEntityDatabaseRepository } from "../base/entity";
import { ISessionEntity } from "../session/DTO";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type IUserEntity = {
  id: string;
  email: string;
  password: string;
};

type IUserWithSession = Omit<IUserEntity, "password"> & {
  session: Omit<ISessionEntity, "userId">;
};

type IUserModel = IEntityDatabaseRepository<
  IUserEntity,
  {
    readByEmail: (email: string) => Promise<IUserEntity | null>;
  }
>;

type IReadUserByEmailDTO = {
  email: string;
  repositories: {
    database: IUserModel;
    cache: ICacheRepositoryAdapter;
  };
};

export type { IUserModel, IUserEntity, IUserWithSession, IReadUserByEmailDTO };
