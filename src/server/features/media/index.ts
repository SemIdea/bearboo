import { t } from "../../createRouter";
import { procedure_deleteMedia } from "./procedures/delete";
import { procedure_readOwnMedia } from "./procedures/readOwn";
import { procedure_uploadMedia } from "./procedures/upload";

const MediaRouter = t.router({
	upload: procedure_uploadMedia,
	readOwn: procedure_readOwnMedia,
	delete: procedure_deleteMedia,
});

export { MediaRouter };
