import { verifiedProcedure } from "@/server/createRouter";
import { domain_createTag } from "../domain/create";
import { createTagOutputSchema, createTagSchema } from "../schema";

const procedure_createTag = verifiedProcedure
	.input(createTagSchema)
	.output(createTagOutputSchema)
	.mutation(async ({ input, ctx }) => domain_createTag({ ctx, input }));

export { procedure_createTag };
