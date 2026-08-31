import { publicProcedure } from "@/server/createRouter";
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

		return domain_recordView({
			ctx,
			input: {
				postId: input.postId,
				visitorId,
				referer: ctx.headers.get("referer"),
				userAgent: ctx.headers.get("user-agent"),
			},
		});
	});

export { procedure_recordView };
