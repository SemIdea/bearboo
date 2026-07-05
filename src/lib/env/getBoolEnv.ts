function getBoolEnv(key: string, fallback: boolean): boolean {
	const value = process.env[key];

	if (value === undefined) return fallback;

	if (["1", "true", "yes", "on"].includes(value.toLowerCase())) return true;
	if (["0", "false", "no", "off"].includes(value.toLowerCase())) return false;

	return fallback;
}

export { getBoolEnv };
