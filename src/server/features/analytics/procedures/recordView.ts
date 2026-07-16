import { TRPCError } from "@trpc/server";
import { publicProcedure } from "@/server/createRouter";
import { PostErrorCode } from "@/shared/error/post";
import { VISITOR_ID_COOKIE_MAX_AGE_SECONDS } from "../constants";
import { domain_recordView } from "../domain/recordView";
import { recordViewOutputSchema, recordViewSchema } from "../schema";

const procedure_recordView = publicProcedure
	.input(recordViewSchema)
	.output(recordViewOutputSchema)
	.mutation(async ({ input, ctx }) => {
		const visitorId = ctx.visitorId ?? ctx.helpers.uid.generate();

		if (!ctx.visitorId) {
			ctx.resCookies.set("visitorId", visitorId, {
				maxAgeSeconds: VISITOR_ID_COOKIE_MAX_AGE_SECONDS,
			});
		}

		const result = await domain_recordView({
			ctx,
			input: { postId: input.postId, visitorId },
		});

		if (!result) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: PostErrorCode.POST_NOT_FOUND,
			});
		}

		return result;
	});

export { procedure_recordView };
