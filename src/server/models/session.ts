import { prisma } from "@/server/infra/drivers/prisma";
import { BaseModel } from "./base";
import type { IUserEntity } from "./user";

type ISessionEntity = {
	id: string;
	userId: string;
	accessToken: string;
	refreshToken: string;
	previousRefreshToken?: string | null;
	createdAt: Date;
	updatedAt: Date;
};

type ISessionWithUser = Omit<ISessionEntity, "userId" | "id"> & {
	user: Omit<IUserEntity, "password">;
};

class SessionModelClass extends BaseModel<ISessionEntity> {
	constructor() {
		super(prisma.session);
	}

	async readByAccessToken(accessToken: string): Promise<ISessionEntity | null> {
		return prisma.session.findFirst({
			where: {
				accessToken,
			},
		});
	}

	async readByRefreshToken(
		refreshToken: string,
	): Promise<ISessionEntity | null> {
		return prisma.session.findFirst({
			where: {
				refreshToken,
			},
		});
	}

	async readByPreviousRefreshToken(
		previousRefreshToken: string,
	): Promise<ISessionEntity | null> {
		return prisma.session.findFirst({
			where: {
				previousRefreshToken,
			},
		});
	}
}

const SessionModel = new SessionModelClass();

type ISessionModel = BaseModel<ISessionEntity> & {
	readByAccessToken: (accessToken: string) => Promise<ISessionEntity | null>;
	readByRefreshToken: (refreshToken: string) => Promise<ISessionEntity | null>;
	readByPreviousRefreshToken: (
		previousRefreshToken: string,
	) => Promise<ISessionEntity | null>;
};

export type { ISessionEntity, ISessionModel, ISessionWithUser };
export { SessionModel };
