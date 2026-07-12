type IPendingCookie = {
	name: string;
	value: string;
	maxAgeSeconds?: number;
	expires?: Date;
};

class CookieJar {
	readonly pending: IPendingCookie[] = [];

	set(name: string, value: string, opts?: { maxAgeSeconds?: number }) {
		this.pending.push({ name, value, maxAgeSeconds: opts?.maxAgeSeconds });
	}

	clear(name: string) {
		this.pending.push({ name, value: "", expires: new Date(0) });
	}
}

export type { IPendingCookie };
export { CookieJar };
