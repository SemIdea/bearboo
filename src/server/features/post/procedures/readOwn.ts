import { protectedProcedure } from "@/server/createRouter";
import { domain_readOwnPosts } from "../domain/readOwn";
import { readOwnPostsOutputSchema, readOwnPostsSchema } from "../schema";

const procedure_readOwnPosts = protectedProcedure
	.input(readOwnPostsSchema)
	.output(readOwnPostsOutputSchema)
	.query(async ({ input, ctx }) =>
		domain_readOwnPosts({
			ctx,
			input: { ...input, userId: ctx.user.id, role: ctx.user.role },
		}),
	);

export { procedure_readOwnPosts };
