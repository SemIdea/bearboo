function getIntEnv(key: string, fallback: number): number {
	const value = process.env[key];

	if (!value || isNaN(Number(value))) return fallback;

	return Number(value);
}

export { getIntEnv };
