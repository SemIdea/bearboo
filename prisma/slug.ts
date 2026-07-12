// Scripts em prisma/ rodam via `node` nativo (sem bundler), que exige extensão
// em todo import relativo. `src/lib/slug/implementations/kebabCase.ts` importa
// `../adapter` sem extensão (válido só sob `moduleResolution: "bundler"`), então
// reimportar esse módulo daqui quebra a cadeia de resolução — ver docs/gotchas.md.
// Este arquivo é a única fonte da lógica pros scripts de prisma/ (sem import
// relativo próprio, então nada de cadeia pra quebrar).
const COMBINING_DIACRITICS_START = 0x0300;
const COMBINING_DIACRITICS_END = 0x036f;
const DIACRITICS_REGEX = new RegExp(
	`[${String.fromCharCode(COMBINING_DIACRITICS_START)}-${String.fromCharCode(COMBINING_DIACRITICS_END)}]`,
	"g",
);

function generateSlug(title: string): string {
	return title
		.normalize("NFD")
		.replace(DIACRITICS_REGEX, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80)
		.replace(/-+$/g, "");
}

export { generateSlug };
