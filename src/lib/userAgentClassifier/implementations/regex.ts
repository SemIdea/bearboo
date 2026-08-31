import { IUserAgentClassifierHelperAdapter } from "../adapter";

const detectBrowser = (ua: string): string => {
	if (/edg\//i.test(ua)) return "Edge";
	if (/chrome\//i.test(ua)) return "Chrome";
	if (/firefox\//i.test(ua)) return "Firefox";
	if (/safari\//i.test(ua)) return "Safari";

	return "Unknown";
};

const detectOs = (ua: string): string => {
	if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
	if (/android/i.test(ua)) return "Android";
	if (/windows/i.test(ua)) return "Windows";
	if (/mac os x|macintosh/i.test(ua)) return "macOS";
	if (/linux/i.test(ua)) return "Linux";

	return "Unknown";
};

class RegexUserAgentClassifier implements IUserAgentClassifierHelperAdapter {
	classify(userAgent: string) {
		if (!userAgent) return { browser: "Unknown", os: "Unknown" };

		return {
			browser: detectBrowser(userAgent),
			os: detectOs(userAgent),
		};
	}
}

export { RegexUserAgentClassifier };
