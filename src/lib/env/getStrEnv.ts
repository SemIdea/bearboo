function getStrEnv(key: string, fallback: string): string {
	const value = process.env[key];

	return value ?? fallback;
}

export { getStrEnv };
