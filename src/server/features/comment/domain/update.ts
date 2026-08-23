import { DomainInput } from "@/server/createDomain";
import { AppError } from "@/shared/error/appError";
import { UpdateCommentInput } from "../schema";

const domain_updateComment = async ({
	ctx,
	input,
}: DomainInput<UpdateCommentInput & { userId: string }>) => {
	const comment = await ctx.repositories.comment.read(input.id);

	if (!comment) {
		throw new AppError("comment.not_found");
	}

	if (comment.userId !== input.userId) {
		throw new AppError("comment.update_forbidden");
	}

	return ctx.repositories.comment.update(input.id, {
		content: input.content,
	});
};

export { domain_updateComment };
