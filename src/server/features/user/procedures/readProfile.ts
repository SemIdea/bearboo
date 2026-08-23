import { publicProcedure } from "@/server/createRouter";
import { domain_readUserProfile } from "../domain/readProfile";
import { readUserProfileOutputSchema, readUserProfileSchema } from "../schema";

const procedure_readUserProfile = publicProcedure
	.input(readUserProfileSchema)
	.output(readUserProfileOutputSchema)
	.query(async ({ input, ctx }) => {
		if (ctx.user && input.id === ctx.user.id) {
			return {
				id: ctx.user.id,
				name: ctx.user.name,
				email: ctx.user.email,
				verified: ctx.user.verified,
				role: ctx.user.role,
				createdAt: ctx.user.createdAt,
				updatedAt: ctx.user.updatedAt,
				bio: ctx.user.bio,
			};
		}

		return domain_readUserProfile({ ctx, input });
	});

export { procedure_readUserProfile };
