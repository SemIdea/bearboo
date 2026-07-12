import { roleProcedure } from "@/server/createRouter";
import { domain_updateUserRole } from "../domain/updateRole";
import { updateUserRoleOutputSchema, updateUserRoleSchema } from "../schema";

const procedure_updateUserRole = roleProcedure(["ADMIN"])
	.input(updateUserRoleSchema)
	.output(updateUserRoleOutputSchema)
	.mutation(async ({ input, ctx }) => domain_updateUserRole({ ctx, input }));

export { procedure_updateUserRole };
