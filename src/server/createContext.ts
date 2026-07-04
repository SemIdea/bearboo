import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { env } from "@/lib/env";
import { domain_readUserAndSessionByAccessToken } from "./features/auth/domain/readUserAndSessionByAccessToken";
import { gateways, IGateways } from "./infra/container/gateways";
import { helpers, IHelpers } from "./infra/container/helpers";
import { IRepositories, repositories } from "./infra/container/repositories";
import { IUserWithSession } from "./models/user";

type IInputAPIContextDTO = {
	headers: Headers;
};

type IBaseContextDTO = IInputAPIContextDTO & {
	headers: Headers;
	repositories: IRepositories;
	helpers: IHelpers;
	gateways: IGateways;
	env: typeof env;
};

type IAPIContextDTO = IBaseContextDTO & {
	user?: IUserWithSession;
};

type IProtectedAPIContextDTO = IBaseContextDTO & {
	user: IUserWithSession;
};

const createTRPCContext = async ({
	headers,
}: IInputAPIContextDTO): Promise<IAPIContextDTO> => {
	const ctx: IAPIContextDTO = {
		headers,
		repositories,
		helpers,
		gateways,
		env,
	};

	const cookies = headers.get("cookie");

	if (!cookies) return ctx;
	const cookieStore = parseCookie(cookies);
	const accessToken = cookieStore.get("accessToken") || null;

	if (!accessToken) return ctx;

	const user = await domain_readUserAndSessionByAccessToken({
		ctx,
		input: { accessToken },
	});

	if (!user) return ctx;

	ctx.user = user;

	return ctx;
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

export type {
	Context,
	IAPIContextDTO,
	IBaseContextDTO,
	IInputAPIContextDTO,
	IProtectedAPIContextDTO,
};
export { createTRPCContext };
