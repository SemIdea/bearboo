import { IResetTokenModel } from "@/server/entities/resetToken/DTO";
import { IUserModel } from "@/server/entities/user/DTO";
import { IUidGeneratorHelperAdapter } from "@/server/integrations/helpers/uidGenerator/adapter";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type ISendResetPasswordEmailDTO = {
  email: string;
  repositories: {
    database: IUserModel;
    cache: ICacheRepositoryAdapter;
    resetToken: IResetTokenModel;
  };
  helpers: {
    uid: IUidGeneratorHelperAdapter;
  };
};

export type { ISendResetPasswordEmailDTO };
