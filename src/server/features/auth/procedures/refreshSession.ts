import { t } from "@/server/createRouter";
import { domain_readSessionByRefreshToken } from "../domain/readSessionByRefreshToken";
import { domain_refreshSession } from "../domain/refreshSession";
import { refreshSessionOutputSchema, refreshSessionSchema } from "../schema";

const procedure_refreshSession = t.procedure
	.input(refreshSessionSchema)
	.output(refreshSessionOutputSchema)
	.mutation(async ({ input, ctx }) => {
		const session = await domain_readSessionByRefreshToken({ ctx, input });

		return domain_refreshSession({ ctx, input: { id: session.id } });
	});

export { procedure_refreshSession };
