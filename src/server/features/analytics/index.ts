import { t } from "@/server/createRouter";
import { procedure_readDashboard } from "./procedures/readDashboard";
import { procedure_recordView } from "./procedures/recordView";

const AnalyticsRouter = t.router({
	readDashboard: procedure_readDashboard,
	recordView: procedure_recordView,
});

export { AnalyticsRouter };
