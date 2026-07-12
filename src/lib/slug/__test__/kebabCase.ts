import { describe, expect, test } from "vitest";
import { KebabCaseSlugGenerator } from "../implementations/kebabCase";

describe("KebabCaseSlugGenerator Unitary Testing", () => {
	const generator = new KebabCaseSlugGenerator();

	test("Should convert a simple title to kebab-case", () => {
		expect(generator.generate("Como fiz X")).toEqual("como-fiz-x");
	});

	test("Should strip accents", () => {
		expect(generator.generate("Não é fácil")).toEqual("nao-e-facil");
	});

	test("Should collapse repeated separators and trim edges", () => {
		expect(generator.generate("  Hello   World!!  ")).toEqual("hello-world");
	});

	test("Should truncate very long titles to a reasonable length", () => {
		const longTitle = "a".repeat(200);

		const slug = generator.generate(longTitle);

		expect(slug.length).toBeLessThanOrEqual(80);
		expect(slug.endsWith("-")).toBe(false);
	});
});
