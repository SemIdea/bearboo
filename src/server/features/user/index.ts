import { t } from "../../createRouter";
import { procedure_loginUser } from "./procedures/login";
import { procedure_readUserComments } from "./procedures/readComments";
import { procedure_readUserPosts } from "./procedures/readPosts";
import { procedure_readUserProfile } from "./procedures/readProfile";
import { procedure_registerUser } from "./procedures/register";
import { procedure_updateUserProfile } from "./procedures/updateProfile";
import { procedure_updateUserRole } from "./procedures/updateRole";

const UserRouter = t.router({
	read: procedure_readUserProfile,
	readPosts: procedure_readUserPosts,
	readComments: procedure_readUserComments,
	update: procedure_updateUserProfile,
	updateRole: procedure_updateUserRole,
	login: procedure_loginUser,
	register: procedure_registerUser,
});

export { UserRouter };
