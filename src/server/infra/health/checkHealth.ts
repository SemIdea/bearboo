type HealthProbeResult = {
	database: "connected" | "disconnected";
};

const checkHealth = (): Promise<HealthProbeResult> => {
	throw new Error("checkHealth is not implemented yet");
};

export { checkHealth };
export type { HealthProbeResult };
