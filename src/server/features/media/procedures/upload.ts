import { protectedProcedure } from "@/server/createRouter";
import { domain_uploadMedia } from "../domain/upload";
import { uploadMediaOutputSchema, uploadMediaSchema } from "../schema";

const procedure_uploadMedia = protectedProcedure
	.input(uploadMediaSchema)
	.output(uploadMediaOutputSchema)
	.mutation(async ({ input, ctx }) =>
		domain_uploadMedia({ ctx, input: { ...input, userId: ctx.user.id } }),
	);

export { procedure_uploadMedia };
