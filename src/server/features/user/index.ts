import { t } from "../../createRouter";
import { readUserCommentsProcedure } from "./procedures/readComments";
import { readUserPostsProcedure } from "./procedures/readPosts";
import { readUserProfileProcedure } from "./procedures/readProfile";
import { updateUserProfileProcedure } from "./procedures/updateProfile";
import { loginUserProcedure } from "./procedures/login";
import { registerUserProcedure } from "./procedures/register";

const UserRouter = t.router({
  read: readUserProfileProcedure,
  readPosts: readUserPostsProcedure,
  readComments: readUserCommentsProcedure,
  update: updateUserProfileProcedure,
  login: loginUserProcedure,
  register: registerUserProcedure
});

export { UserRouter };
