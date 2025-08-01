import { IResetTokenModel } from "@/server/entities/resetToken/DTO";
import { IUserModel } from "@/server/entities/user/DTO";
import { IPasswordHashingHelperAdapter } from "@/server/integrations/helpers/passwordHashing/adapter";
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

type IResetPasswordDTO = {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
  repositories: {
    database: IUserModel;
    resetToken: IResetTokenModel;
    cache: ICacheRepositoryAdapter;
  };
  helpers: {
    hashing: IPasswordHashingHelperAdapter;
  };
};

export type { ISendResetPasswordEmailDTO, IResetPasswordDTO };
