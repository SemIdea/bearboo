import { describe, expect, test } from "vitest";
import { RegexReferrerClassifier } from "../implementations/regex";

describe("RegexReferrerClassifier Unitary Testing", () => {
	const classifier = new RegexReferrerClassifier();

	test("Should classify a missing referrer as DIRECT", () => {
		expect(classifier.classify(null)).toBe("DIRECT");
		expect(classifier.classify(undefined)).toBe("DIRECT");
		expect(classifier.classify("")).toBe("DIRECT");
	});

	test("Should classify known search engines as SEARCH", () => {
		expect(classifier.classify("https://www.google.com/search?q=x")).toBe(
			"SEARCH",
		);
		expect(classifier.classify("https://www.bing.com/search?q=x")).toBe(
			"SEARCH",
		);
		expect(classifier.classify("https://duckduckgo.com/?q=x")).toBe("SEARCH");
	});

	test("Should classify known social networks as SOCIAL", () => {
		expect(classifier.classify("https://twitter.com/someone/status/1")).toBe(
			"SOCIAL",
		);
		expect(classifier.classify("https://www.facebook.com/")).toBe("SOCIAL");
		expect(classifier.classify("https://t.co/abc123")).toBe("SOCIAL");
	});

	test("Should classify an unrecognized referring site as OTHER", () => {
		expect(classifier.classify("https://some-other-blog.example/post/1")).toBe(
			"OTHER",
		);
	});

	test("Should classify a malformed referrer as OTHER instead of throwing", () => {
		expect(classifier.classify("not-a-valid-url")).toBe("OTHER");
	});
});
