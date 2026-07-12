import { ISlugGeneratorHelperAdapter } from "../adapter";

const MAX_SLUG_LENGTH = 80;

const COMBINING_DIACRITICS_START = 0x0300;
const COMBINING_DIACRITICS_END = 0x036f;
const DIACRITICS_REGEX = new RegExp(
	`[${String.fromCharCode(COMBINING_DIACRITICS_START)}-${String.fromCharCode(COMBINING_DIACRITICS_END)}]`,
	"g",
);

class KebabCaseSlugGenerator implements ISlugGeneratorHelperAdapter {
	generate(input: string): string {
		return input
			.normalize("NFD")
			.replace(DIACRITICS_REGEX, "")
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "")
			.slice(0, MAX_SLUG_LENGTH)
			.replace(/-+$/g, "");
	}
}

export { KebabCaseSlugGenerator };
