import { TRPCError } from "@trpc/server";
import { roleProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { domain_updateUserRole } from "../domain/updateRole";
import { updateUserRoleOutputSchema, updateUserRoleSchema } from "../schema";

const procedure_updateUserRole = roleProcedure(["ADMIN"])
	.input(updateUserRoleSchema)
	.output(updateUserRoleOutputSchema)
	.mutation(async ({ input, ctx }) => {
		try {
			return await domain_updateUserRole({ ctx, input });
		} catch (error) {
			if (error instanceof DomainError) {
				throw new TRPCError({
					code: error.httpCode,
					message: error.message,
					cause: error,
				});
			}

			throw error;
		}
	});

export { procedure_updateUserRole };
