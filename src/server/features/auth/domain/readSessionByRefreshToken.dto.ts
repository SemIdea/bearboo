import { ISessionModel } from "@/server/models/session";
import { IUserModel } from "@/server/models/user";

type IReadSessionByRefreshTokenDTO = {
  refreshToken: string;
  repositories: {
    user: IUserModel;
    database: ISessionModel;
  };
};

export type { IReadSessionByRefreshTokenDTO };
