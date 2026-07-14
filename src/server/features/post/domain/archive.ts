import { TRPCError } from "@trpc/server";
import { revalidateTag } from "next/cache";
import { DomainInput } from "@/server/createDomain";
import { IRole } from "@/server/models/user";
import { PostErrorCode } from "@/shared/error/post";
import { ArchivePostInput } from "../schema";

const domain_archivePost = async ({
	ctx,
	input,
}: DomainInput<ArchivePostInput & { role: IRole }>) => {
	const post = await ctx.repositories.post.read(input.id);

	if (!post) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: PostErrorCode.POST_NOT_FOUND,
		});
	}

	if (!ctx.helpers.permissions.can(input.role, "post:publish")) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: PostErrorCode.POST_UPDATE_FORBIDDEN,
		});
	}

	if (post.status === "ARCHIVED") {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: PostErrorCode.POST_INVALID_STATUS_TRANSITION,
		});
	}

	const updated = await ctx.repositories.post.update(input.id, {
		status: "ARCHIVED",
	});

	revalidateTag("posts", "hours");

	return updated;
};

export { domain_archivePost };
