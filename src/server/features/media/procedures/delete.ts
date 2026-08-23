import { protectedProcedure } from "@/server/createRouter";
import { domain_deleteMedia } from "../domain/delete";
import { deleteMediaOutputSchema, deleteMediaSchema } from "../schema";

const procedure_deleteMedia = protectedProcedure
	.input(deleteMediaSchema)
	.output(deleteMediaOutputSchema)
	.mutation(async ({ input, ctx }) => {
		const success = await domain_deleteMedia({
			ctx,
			input: { ...input, userId: ctx.user.id, role: ctx.user.role },
		});

		return { success };
	});

export { procedure_deleteMedia };
