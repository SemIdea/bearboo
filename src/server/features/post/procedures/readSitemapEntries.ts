import { publicProcedure } from "@/server/createRouter";
import { domain_readSitemapEntries } from "../domain/readSitemapEntries";
import { readSitemapEntriesOutputSchema } from "../schema";

const procedure_readSitemapEntries = publicProcedure
	.output(readSitemapEntriesOutputSchema)
	.query(async ({ ctx }) => domain_readSitemapEntries({ ctx, input: {} }));

export { procedure_readSitemapEntries };
