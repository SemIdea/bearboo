import { DomainInput } from "@/server/createDomain";
import { AppError } from "@/shared/error/appError";
import { DeleteCommentInput } from "../schema";

const domain_deleteComment = async ({
	ctx,
	input,
}: DomainInput<DeleteCommentInput & { userId: string }>) => {
	const comment = await ctx.repositories.comment.read(input.id);

	if (!comment) {
		throw new AppError("comment.not_found");
	}

	if (comment.userId !== input.userId) {
		throw new AppError("comment.delete_forbidden");
	}

	return ctx.repositories.comment.delete(input.id);
};

export { domain_deleteComment };
