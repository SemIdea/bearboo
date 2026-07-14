import { IRole } from "@/server/models/user";
import { IPermissionAction, IPermissionHelperAdapter } from "../adapter";

const PERMISSION_MATRIX: Record<IPermissionAction, IRole[]> = {
	"post:editAny": ["ADMIN", "EDITOR"],
	"post:deleteAny": ["ADMIN", "EDITOR"],
	"post:publish": ["ADMIN", "EDITOR"],
	"category:manage": ["ADMIN", "EDITOR"],
	"user:manageRoles": ["ADMIN"],
};

class MatrixPermission implements IPermissionHelperAdapter {
	can(role: IRole, action: IPermissionAction) {
		return PERMISSION_MATRIX[action].includes(role);
	}
}

export { MatrixPermission };
