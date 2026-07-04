import { IRepositories } from "@/server/infra/container/repositories";
import { FakeCommentModel } from "./comment";
import { FakePostModel } from "./post";
import { FakeResetTokenModel } from "./resetToken";
import { FakeSessionModel } from "./session";
import { FakeUserModel } from "./user";
import { FakeVerifyTokenModel } from "./verifyToken";

function createInMemoryRepositories(): IRepositories {
	const user = new FakeUserModel();
	const session = new FakeSessionModel();
	const comment = new FakeCommentModel(user);
	const post = new FakePostModel(user, comment);
	const verifyToken = new FakeVerifyTokenModel();
	const resetToken = new FakeResetTokenModel();

	return { user, session, post, comment, verifyToken, resetToken };
}

export { createInMemoryRepositories };
