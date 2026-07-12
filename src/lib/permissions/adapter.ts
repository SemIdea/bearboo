import { IRole } from "@/server/models/user";

type IPermissionAction =
	| "post:editAny"
	| "post:deleteAny"
	| "category:manage"
	| "user:manageRoles";

type IPermissionHelperAdapter = {
	can: (role: IRole, action: IPermissionAction) => boolean;
};

export type { IPermissionAction, IPermissionHelperAdapter };
