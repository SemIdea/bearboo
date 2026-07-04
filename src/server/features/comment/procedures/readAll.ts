import { publicProcedure } from "@/server/createRouter";
import { domain_readAllCommentsByPost } from "../domain/readAll";
import {
	readAllCommentsByPostOutputSchema,
	readAllCommentsByPostSchema,
} from "../schema";

const procedure_readAllCommentsByPost = publicProcedure
	.input(readAllCommentsByPostSchema)
	.output(readAllCommentsByPostOutputSchema)
	.query(async ({ input, ctx }) =>
		domain_readAllCommentsByPost({ ctx, input }),
	);

export { procedure_readAllCommentsByPost };
