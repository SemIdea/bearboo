import { describe, expect, test } from "vitest";
import { RegexUserAgentClassifier } from "../implementations/regex";

const UA = {
	chromeWindows:
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
	safariIos:
		"Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
	firefoxLinux:
		"Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0",
	edgeWindows:
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
	chromeAndroid:
		"Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
	safariMac:
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
};

describe("RegexUserAgentClassifier Unitary Testing", () => {
	const classifier = new RegexUserAgentClassifier();

	test("Should classify Chrome on Windows", () => {
		expect(classifier.classify(UA.chromeWindows)).toEqual({
			browser: "Chrome",
			os: "Windows",
		});
	});

	test("Should classify Safari on iOS", () => {
		expect(classifier.classify(UA.safariIos)).toEqual({
			browser: "Safari",
			os: "iOS",
		});
	});

	test("Should classify Firefox on Linux", () => {
		expect(classifier.classify(UA.firefoxLinux)).toEqual({
			browser: "Firefox",
			os: "Linux",
		});
	});

	test("Should classify Edge distinctly from Chrome even though it shares the Chrome token", () => {
		expect(classifier.classify(UA.edgeWindows)).toEqual({
			browser: "Edge",
			os: "Windows",
		});
	});

	test("Should classify Chrome on Android", () => {
		expect(classifier.classify(UA.chromeAndroid)).toEqual({
			browser: "Chrome",
			os: "Android",
		});
	});

	test("Should classify Safari on macOS", () => {
		expect(classifier.classify(UA.safariMac)).toEqual({
			browser: "Safari",
			os: "macOS",
		});
	});

	test("Should classify an empty/unrecognized user agent as Unknown", () => {
		expect(classifier.classify("")).toEqual({
			browser: "Unknown",
			os: "Unknown",
		});
		expect(classifier.classify("SomeWeirdBot/1.0")).toEqual({
			browser: "Unknown",
			os: "Unknown",
		});
	});
});
