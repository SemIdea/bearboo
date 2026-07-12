import { prisma } from "@/server/infra/drivers/prisma";
import { BaseModel } from "./base";
import type { ISessionEntity } from "./session";

type IRole = "ADMIN" | "EDITOR" | "AUTHOR";

type IUserEntity = {
	id: string;
	name: string;
	email: string;
	password: string;
	verified: boolean;
	role: IRole;
	createdAt: Date;
	updatedAt: Date;
	bio?: string | null;
};

type IUserWithSession = Omit<IUserEntity, "password"> & {
	session: Omit<ISessionEntity, "userId">;
};

class UserModelClass extends BaseModel<IUserEntity> {
	constructor() {
		super(prisma.user);
	}

	async readByEmail(email: string): Promise<IUserEntity | null> {
		return prisma.user.findUnique({
			where: {
				email,
			},
		});
	}
}

const UserModel = new UserModelClass();

type IUserModel = BaseModel<IUserEntity> & {
	readByEmail: (email: string) => Promise<IUserEntity | null>;
};

export type { IRole, IUserEntity, IUserModel, IUserWithSession };
export { UserModel };
