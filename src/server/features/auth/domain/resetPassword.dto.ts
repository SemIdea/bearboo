import { IResetTokenModel } from "@/server/entities/resetToken/DTO";
import { IUserModel } from "@/server/entities/user/DTO";
import { IPasswordHashingHelperAdapter } from "@/server/integrations/helpers/passwordHashing/adapter";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

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

export type { IResetPasswordDTO };
