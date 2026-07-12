import { t } from "../../createRouter";
import { procedure_createCategory } from "./procedures/create";
import { procedure_readAllCategories } from "./procedures/readAll";

const CategoryRouter = t.router({
	create: procedure_createCategory,
	readAll: procedure_readAllCategories,
});

export { CategoryRouter };
