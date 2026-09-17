import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { checkHealth } from "@/server/infra/health/checkHealth";

const GET = async (): Promise<NextResponse> => {
	const { database } = await checkHealth();
	const healthy = database === "connected";

	return NextResponse.json(
		{
			status: healthy ? "ok" : "degraded",
			database,
			version: env.version,
		},
		{
			status: healthy ? 200 : 503,
			headers: { "Cache-Control": "no-store" },
		},
	);
};

export { GET };
