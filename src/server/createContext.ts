import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { env } from "@/lib/env";
import { AppError } from "@/shared/error/appError";
import { domain_readUserAndSessionByAccessToken } from "./features/auth/domain/readUserAndSessionByAccessToken";
import { CookieJar } from "./http/cookieJar";
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
	resCookies: CookieJar;
	refreshToken?: string;
	visitorId?: string;
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
		resCookies: new CookieJar(),
	};

	const cookies = headers.get("cookie");

	if (!cookies) return ctx;
	const cookieStore = parseCookie(cookies);
	const accessToken = cookieStore.get("accessToken") || null;
	const refreshToken = cookieStore.get("refreshToken") || null;
	const visitorId = cookieStore.get("visitorId") || null;

	if (refreshToken) ctx.refreshToken = refreshToken;
	if (visitorId) ctx.visitorId = visitorId;
	if (!accessToken) return ctx;

	let user: IUserWithSession | null;

	try {
		user = await domain_readUserAndSessionByAccessToken({
			ctx,
			input: { accessToken },
		});
	} catch (error) {
		// Keyed on the specific domain code, not on a transport code: keying on
		// `httpCode === "UNAUTHORIZED"` would let any of the five codes mapped to
		// it clear the user's session cookies. Only an invalid access token
		// should, and it's the only code this lookup throws.
		if (
			error instanceof AppError &&
			error.code === "session.access_token_invalid"
		) {
			ctx.resCookies.clear("accessToken");
			ctx.resCookies.clear("refreshToken");
			return ctx;
		}

		throw error;
	}

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
