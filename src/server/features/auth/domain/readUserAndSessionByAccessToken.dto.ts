import { ISessionModel } from "@/server/models/session";
import { IUserModel } from "@/server/models/user";

type IReadUserAndSessionByAccessTokenDTO = {
  accessToken: string;
  repositories: {
    user: IUserModel;
    database: ISessionModel;
  };
};

export type { IReadUserAndSessionByAccessTokenDTO };
