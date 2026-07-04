import { IResetTokenModel } from "@/server/models/resetToken";
import { IUserModel } from "@/server/models/user";
import { IPasswordHashingHelperAdapter } from "@/lib/passwordHashing/adapter";

type IResetPasswordDTO = {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
  repositories: {
    database: IUserModel;
    resetToken: IResetTokenModel;
  };
  helpers: {
    hashing: IPasswordHashingHelperAdapter;
  };
};

export type { IResetPasswordDTO };
