import { IBaseContextDTO } from "@/server/createContext";
import { IUserEntity } from "@/server/models/user";
import { ISessionEntity } from "@/server/models/session";
import { IPostEntity } from "@/server/models/post";
import { ICommentEntity } from "@/server/models/comment";

type IAuthenticatedUserDTO = IUserEntity & {
  truePassword: string;
  session: ISessionEntity;
};

type ITestContextDTO = IBaseContextDTO & {
  user?: IAuthenticatedUserDTO;
  createAuthenticatedUser: () => Promise<void>;
  createNewUser: () => Promise<IUserEntity>;
  createPost: (
    overrides?: Partial<Pick<IPostEntity, "title" | "content" | "userId">>
  ) => Promise<IPostEntity>;
  createComment: (
    overrides?: Partial<Pick<ICommentEntity, "postId" | "content" | "userId">>
  ) => Promise<ICommentEntity>;
};

type IControllerContextDTO = ITestContextDTO & {
  user: IAuthenticatedUserDTO;
};

export type { IAuthenticatedUserDTO, ITestContextDTO, IControllerContextDTO };
