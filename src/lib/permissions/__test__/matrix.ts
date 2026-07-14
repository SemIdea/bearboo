import { describe, expect, test } from "vitest";
import { IRole } from "@/server/models/user";
import { IPermissionAction } from "../adapter";
import { MatrixPermission } from "../implementations/matrix";

const ROLES: IRole[] = ["ADMIN", "EDITOR", "AUTHOR"];
const ACTIONS: IPermissionAction[] = [
	"post:editAny",
	"post:deleteAny",
	"post:publish",
	"category:manage",
	"user:manageRoles",
];

const EXPECTED: Record<IPermissionAction, Record<IRole, boolean>> = {
	"post:editAny": { ADMIN: true, EDITOR: true, AUTHOR: false },
	"post:deleteAny": { ADMIN: true, EDITOR: true, AUTHOR: false },
	"post:publish": { ADMIN: true, EDITOR: true, AUTHOR: false },
	"category:manage": { ADMIN: true, EDITOR: true, AUTHOR: false },
	"user:manageRoles": { ADMIN: true, EDITOR: false, AUTHOR: false },
};

describe("MatrixPermission Unitary Testing", () => {
	const permissions = new MatrixPermission();

	for (const action of ACTIONS) {
		for (const role of ROLES) {
			test(`Should ${EXPECTED[action][role] ? "allow" : "reject"} ${role} for ${action}`, () => {
				expect(permissions.can(role, action)).toBe(EXPECTED[action][role]);
			});
		}
	}
});
