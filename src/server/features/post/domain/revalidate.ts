import { revalidateTag } from "next/cache";
import { DomainInput } from "@/server/createDomain";
import { AppError } from "@/shared/error/appError";
import { RevalidatePostInput } from "../schema";

const domain_revalidatePost = async ({
	ctx,
	input,
}: DomainInput<RevalidatePostInput & { userId: string }>) => {
	const post = await ctx.repositories.post.read(input.id);

	if (!post) {
		throw new AppError("post.not_found");
	}

	if (post.userId !== input.userId) {
		throw new AppError("post.update_forbidden");
	}

	revalidateTag("posts", "hours");

	return post;
};

export { domain_revalidatePost };
