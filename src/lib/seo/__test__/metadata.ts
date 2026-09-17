import { describe, expect, test } from "vitest";
import { buildHomeMetadata, buildRootMetadata } from "../metadata";

const siteUrl = "https://bearboo.test";

describe("buildRootMetadata Unitary Testing", () => {
	test("Should carry the complete Open Graph set", () => {
		const metadata = buildRootMetadata({ siteUrl });

		expect(metadata.openGraph).toMatchObject({
			type: "website",
			locale: "en_US",
			siteName: "Bearboo",
			url: siteUrl,
			title: "Bearboo",
		});
		expect(metadata.openGraph?.description).toBeTruthy();
	});

	test("Should set metadataBase from the site URL", () => {
		expect(buildRootMetadata({ siteUrl }).metadataBase?.toString()).toBe(
			`${siteUrl}/`,
		);
	});

	test("Should omit verification when no code is given", () => {
		expect(
			buildRootMetadata({ siteUrl, googleVerification: "" }).verification,
		).toBeUndefined();
	});

	test("Should include the Google verification when a code is given", () => {
		expect(
			buildRootMetadata({ siteUrl, googleVerification: "abc123" }).verification,
		).toEqual({ google: "abc123" });
	});
});

describe("buildHomeMetadata Unitary Testing", () => {
	test("Should set a self-referential canonical on the home", () => {
		expect(buildHomeMetadata().alternates?.canonical).toBe("/");
	});
});
