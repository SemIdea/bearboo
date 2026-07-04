import { IResetTokenModel } from "@/server/models/resetToken";
import { IUserModel } from "@/server/models/user";
import { IUidGeneratorHelperAdapter } from "@/server/integrations/helpers/uidGenerator/adapter";

type ISendResetPasswordEmailDTO = {
  email: string;
  repositories: {
    database: IUserModel;
    resetToken: IResetTokenModel;
  };
  helpers: {
    uid: IUidGeneratorHelperAdapter;
  };
};

export type { ISendResetPasswordEmailDTO };
