import { ISessionModel } from "@/server/models/session";
import { IUserModel } from "@/server/models/user";

type IDeleteSessionDTO = {
  id: string;
  userId: string;
  repositories: {
    user: IUserModel;
    database: ISessionModel;
  };
};

export type { IDeleteSessionDTO };
