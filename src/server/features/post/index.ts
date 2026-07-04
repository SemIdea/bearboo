import { t } from "../../createRouter";
import { createPostProcedure } from "./procedures/create";
import { deletePostProcedure } from "./procedures/delete";
import { readPostProcedure } from "./procedures/read";
import { updatePostProcedure } from "./procedures/update";
import { revalidatePostProcedure } from "./procedures/revalidate";
import { readRecentPostsProcedure } from "./procedures/readRecent";

const PostRouter = t.router({
  create: createPostProcedure,
  read: readPostProcedure,
  readRecent: readRecentPostsProcedure,
  update: updatePostProcedure,
  revalidate: revalidatePostProcedure,
  delete: deletePostProcedure
});

export { PostRouter };
