import { CategoryModel, ICategoryModel } from "@/server/models/category";
import { CommentModel, ICommentModel } from "@/server/models/comment";
import { IMediaModel, MediaModel } from "@/server/models/media";
import { IPostModel, PostModel } from "@/server/models/post";
import { IPostViewModel, PostViewModel } from "@/server/models/postView";
import { IResetTokenModel, ResetTokenModel } from "@/server/models/resetToken";
import {
	IReviewCommentModel,
	ReviewCommentModel,
} from "@/server/models/reviewComment";
import { ISessionModel, SessionModel } from "@/server/models/session";
import { ITagModel, TagModel } from "@/server/models/tag";
import { IUserModel, UserModel } from "@/server/models/user";
import {
	IVerifyTokenModel,
	VerifyTokenModel,
} from "@/server/models/verifyToken";

type IRepositories = {
	user: IUserModel;
	session: ISessionModel;
	post: IPostModel;
	postView: IPostViewModel;
	comment: ICommentModel;
	category: ICategoryModel;
	tag: ITagModel;
	verifyToken: IVerifyTokenModel;
	resetToken: IResetTokenModel;
	reviewComment: IReviewCommentModel;
	media: IMediaModel;
};

const repositories: IRepositories = {
	user: UserModel,
	session: SessionModel,
	post: PostModel,
	postView: PostViewModel,
	comment: CommentModel,
	category: CategoryModel,
	tag: TagModel,
	verifyToken: VerifyTokenModel,
	resetToken: ResetTokenModel,
	reviewComment: ReviewCommentModel,
	media: MediaModel,
};

export type { IRepositories };
export { repositories };
