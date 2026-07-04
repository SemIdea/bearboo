import { DomainInput } from "@/server/createDomain";
import { CreateCommentInput } from "../schema";

const domain_createComment = async ({
	ctx,
	input,
}: DomainInput<CreateCommentInput & { userId: string }>) => {
	const commentId = ctx.helpers.uid.generate();

	return ctx.repositories.comment.create(commentId, input);
};

export { domain_createComment };
