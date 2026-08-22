import { revalidateTag } from "next/cache";
import { DomainInput } from "@/server/createDomain";
import { IRole } from "@/server/models/user";
import { DomainError } from "@/shared/error/domainError";
import { ArchivePostInput } from "../schema";

const domain_archivePost = async ({
	ctx,
	input,
}: DomainInput<ArchivePostInput & { role: IRole }>) => {
	const post = await ctx.repositories.post.read(input.id);

	if (!post) {
		throw new DomainError("post.not_found");
	}

	if (!ctx.helpers.permissions.can(input.role, "post:publish")) {
		throw new DomainError("post.update_forbidden");
	}

	if (post.status === "ARCHIVED") {
		throw new DomainError("post.invalid_status_transition");
	}

	const updated = await ctx.repositories.post.update(input.id, {
		status: "ARCHIVED",
	});

	revalidateTag("posts", "hours");

	return updated;
};

export { domain_archivePost };
