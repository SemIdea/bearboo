import { TRPCError } from "@trpc/server";
import { publicProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
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

		try {
			return await domain_recordView({
				ctx,
				input: {
					postId: input.postId,
					visitorId,
					referer: ctx.headers.get("referer"),
					userAgent: ctx.headers.get("user-agent"),
				},
			});
		} catch (error) {
			if (error instanceof DomainError) {
				throw new TRPCError({
					code: error.httpCode,
					message: error.message,
					cause: error,
				});
			}

			throw error;
		}
	});

export { procedure_recordView };
