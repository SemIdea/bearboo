import { DomainInput } from "@/server/createDomain";
import { DomainError } from "@/shared/error/domainError";
import { UpdateCommentInput } from "../schema";

const domain_updateComment = async ({
	ctx,
	input,
}: DomainInput<UpdateCommentInput & { userId: string }>) => {
	const comment = await ctx.repositories.comment.read(input.id);

	if (!comment) {
		throw new DomainError("comment.not_found");
	}

	if (comment.userId !== input.userId) {
		throw new DomainError("comment.update_forbidden");
	}

	return ctx.repositories.comment.update(input.id, {
		content: input.content,
	});
};

export { domain_updateComment };
