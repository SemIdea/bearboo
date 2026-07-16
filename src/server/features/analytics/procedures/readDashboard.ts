import { roleProcedure } from "@/server/createRouter";
import { domain_readDashboard } from "../domain/readDashboard";
import { readDashboardOutputSchema } from "../schema";

const procedure_readDashboard = roleProcedure(["ADMIN", "EDITOR"])
	.output(readDashboardOutputSchema)
	.query(async ({ ctx }) => domain_readDashboard({ ctx, input: {} }));

export { procedure_readDashboard };
