import { IPendingCookie } from "./cookieJar";

const serializeCookie = (cookie: IPendingCookie, opts: { secure: boolean }) => {
	const parts = [
		`${cookie.name}=${cookie.value}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
	];

	if (opts.secure) parts.push("Secure");
	if (cookie.maxAgeSeconds !== undefined) {
		parts.push(`Max-Age=${cookie.maxAgeSeconds}`);
	}
	if (cookie.expires) parts.push(`Expires=${cookie.expires.toUTCString()}`);

	return parts.join("; ");
};

export { serializeCookie };
