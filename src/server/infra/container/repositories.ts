import { CommentModel, ICommentModel } from "@/server/models/comment";
import { IPostModel, PostModel } from "@/server/models/post";
import { IResetTokenModel, ResetTokenModel } from "@/server/models/resetToken";
import { ISessionModel, SessionModel } from "@/server/models/session";
import { IUserModel, UserModel } from "@/server/models/user";
import {
	IVerifyTokenModel,
	VerifyTokenModel,
} from "@/server/models/verifyToken";

type IRepositories = {
	user: IUserModel;
	session: ISessionModel;
	post: IPostModel;
	comment: ICommentModel;
	verifyToken: IVerifyTokenModel;
	resetToken: IResetTokenModel;
};

const repositories: IRepositories = {
	user: UserModel,
	session: SessionModel,
	post: PostModel,
	comment: CommentModel,
	verifyToken: VerifyTokenModel,
	resetToken: ResetTokenModel,
};

export type { IRepositories };
export { repositories };
