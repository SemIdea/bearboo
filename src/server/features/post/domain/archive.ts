import { revalidateTag } from "next/cache";
import { DomainInput } from "@/server/createDomain";
import { IRole } from "@/server/models/user";
import { AppError } from "@/shared/error/appError";
import { ArchivePostInput } from "../schema";

const domain_archivePost = async ({
	ctx,
	input,
}: DomainInput<ArchivePostInput & { role: IRole }>) => {
	const post = await ctx.repositories.post.read(input.id);

	if (!post) {
		throw new AppError("post.not_found");
	}

	if (!ctx.helpers.permissions.can(input.role, "post:publish")) {
		throw new AppError("post.update_forbidden");
	}

	if (post.status === "ARCHIVED") {
		throw new AppError("post.invalid_status_transition");
	}

	const updated = await ctx.repositories.post.update(input.id, {
		status: "ARCHIVED",
	});

	revalidateTag("posts", "hours");

	return updated;
};

export { domain_archivePost };
