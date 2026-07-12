import { roleProcedure } from "@/server/createRouter";
import { domain_createCategory } from "../domain/create";
import { createCategoryOutputSchema, createCategorySchema } from "../schema";

const procedure_createCategory = roleProcedure(["ADMIN", "EDITOR"])
	.input(createCategorySchema)
	.output(createCategoryOutputSchema)
	.mutation(async ({ input, ctx }) => domain_createCategory({ ctx, input }));

export { procedure_createCategory };
