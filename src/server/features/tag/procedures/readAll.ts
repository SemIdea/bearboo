import { publicProcedure } from "@/server/createRouter";
import { domain_readAllTags } from "../domain/readAll";
import { readAllTagsOutputSchema } from "../schema";

const procedure_readAllTags = publicProcedure
	.output(readAllTagsOutputSchema)
	.query(async ({ ctx }) => domain_readAllTags({ ctx, input: {} }));

export { procedure_readAllTags };
