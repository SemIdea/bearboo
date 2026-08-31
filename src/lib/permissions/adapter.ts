import { IRole } from "@/server/models/user";

type IPermissionAction =
	| "post:editAny"
	| "post:deleteAny"
	| "post:publish"
	| "category:manage"
	| "user:manageRoles"
	| "media:deleteAny";

type IPermissionHelperAdapter = {
	can: (role: IRole, action: IPermissionAction) => boolean;
};

export type { IPermissionAction, IPermissionHelperAdapter };
