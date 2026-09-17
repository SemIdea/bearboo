import { prisma } from "@/server/infra/drivers/prisma";

type HealthProbeResult = {
	database: "connected" | "disconnected";
};

const checkHealth = async (): Promise<HealthProbeResult> => {
	try {
		await prisma.$queryRaw`SELECT 1`;
		return { database: "connected" };
	} catch {
		return { database: "disconnected" };
	}
};

export type { HealthProbeResult };
export { checkHealth };
