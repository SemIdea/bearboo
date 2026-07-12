import { t } from "../../createRouter";
import { procedure_createTag } from "./procedures/create";
import { procedure_readAllTags } from "./procedures/readAll";

const TagRouter = t.router({
	create: procedure_createTag,
	readAll: procedure_readAllTags,
});

export { TagRouter };
