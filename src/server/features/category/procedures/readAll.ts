import { publicProcedure } from "@/server/createRouter";
import { domain_readAllCategories } from "../domain/readAll";
import { readAllCategoriesOutputSchema } from "../schema";

const procedure_readAllCategories = publicProcedure
	.output(readAllCategoriesOutputSchema)
	.query(async ({ ctx }) => domain_readAllCategories({ ctx, input: {} }));

export { procedure_readAllCategories };
