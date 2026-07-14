import { IBaseContextDTO } from "@/server/createContext";
import { ICategoryEntity } from "@/server/models/category";
import { ICommentEntity } from "@/server/models/comment";
import { IPostEntity } from "@/server/models/post";
import { ISessionEntity } from "@/server/models/session";
import { ITagEntity } from "@/server/models/tag";
import { IRole, IUserEntity } from "@/server/models/user";

type IAuthenticatedUserDTO = IUserEntity & {
	truePassword: string;
	session: ISessionEntity;
};

type ITestContextDTO = IBaseContextDTO & {
	user?: IAuthenticatedUserDTO;
	createAuthenticatedUser: (overrides?: { role?: IRole }) => Promise<void>;
	createNewUser: () => Promise<IUserEntity>;
	createPost: (
		overrides?: Partial<
			Pick<
				IPostEntity,
				| "title"
				| "content"
				| "userId"
				| "slug"
				| "status"
				| "scheduledAt"
				| "categoryId"
			>
		> & { tagIds?: string[] },
	) => Promise<IPostEntity>;
	createComment: (
		overrides?: Partial<Pick<ICommentEntity, "postId" | "content" | "userId">>,
	) => Promise<ICommentEntity>;
	createCategory: (
		overrides?: Partial<Pick<ICategoryEntity, "name" | "slug">>,
	) => Promise<ICategoryEntity>;
	createTag: (
		overrides?: Partial<Pick<ITagEntity, "name" | "slug">>,
	) => Promise<ITagEntity>;
};

type IControllerContextDTO = ITestContextDTO & {
	user: IAuthenticatedUserDTO;
};

export type { IAuthenticatedUserDTO, IControllerContextDTO, ITestContextDTO };
