import { IBaseContextDTO } from "@/server/createContext";
import { ICommentEntity } from "@/server/models/comment";
import { IPostEntity } from "@/server/models/post";
import { ISessionEntity } from "@/server/models/session";
import { IUserEntity } from "@/server/models/user";

type IAuthenticatedUserDTO = IUserEntity & {
	truePassword: string;
	session: ISessionEntity;
};

type ITestContextDTO = IBaseContextDTO & {
	user?: IAuthenticatedUserDTO;
	createAuthenticatedUser: () => Promise<void>;
	createNewUser: () => Promise<IUserEntity>;
	createPost: (
		overrides?: Partial<
			Pick<IPostEntity, "title" | "content" | "userId" | "slug" | "status">
		>,
	) => Promise<IPostEntity>;
	createComment: (
		overrides?: Partial<Pick<ICommentEntity, "postId" | "content" | "userId">>,
	) => Promise<ICommentEntity>;
};

type IControllerContextDTO = ITestContextDTO & {
	user: IAuthenticatedUserDTO;
};

export type { IAuthenticatedUserDTO, IControllerContextDTO, ITestContextDTO };
