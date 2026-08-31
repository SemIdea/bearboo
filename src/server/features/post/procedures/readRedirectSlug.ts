import { publicProcedure } from "@/server/createRouter";
import { domain_readRedirectSlug } from "../domain/readRedirectSlug";
import {
	readRedirectSlugOutputSchema,
	readRedirectSlugSchema,
} from "../schema";

const procedure_readRedirectSlug = publicProcedure
	.input(readRedirectSlugSchema)
	.output(readRedirectSlugOutputSchema)
	.query(async ({ input, ctx }) => domain_readRedirectSlug({ ctx, input }));

export { procedure_readRedirectSlug };
