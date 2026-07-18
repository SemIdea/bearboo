import { IReferrerClassifierHelperAdapter } from "../adapter";

const SEARCH_ENGINE_HOSTS = [
	"google.",
	"bing.com",
	"duckduckgo.com",
	"yahoo.com",
	"baidu.com",
];

const SOCIAL_HOSTS = [
	"facebook.com",
	"twitter.com",
	"x.com",
	"t.co",
	"instagram.com",
	"linkedin.com",
	"reddit.com",
];

const matchesHost = (hostname: string, patterns: string[]) =>
	patterns.some((pattern) => hostname.includes(pattern));

class RegexReferrerClassifier implements IReferrerClassifierHelperAdapter {
	classify(referrer: string | null | undefined) {
		if (!referrer) return "DIRECT" as const;

		let hostname: string;

		try {
			hostname = new URL(referrer).hostname.toLowerCase();
		} catch {
			return "OTHER" as const;
		}

		if (matchesHost(hostname, SEARCH_ENGINE_HOSTS)) return "SEARCH" as const;
		if (matchesHost(hostname, SOCIAL_HOSTS)) return "SOCIAL" as const;

		return "OTHER" as const;
	}
}

export { RegexReferrerClassifier };
