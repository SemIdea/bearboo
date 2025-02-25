import { IAPIContextDTO } from "@/server/createContext"
import { LoginUserService } from "./service"
import { CreateAuthSessionService } from "../../auth/session/service";

const loginUserController = async ({
    input,
    ctx
}: {
    input: any,
    ctx: IAPIContextDTO
}) => {
    const user = await LoginUserService({
        email: input.email,
        password: input.email,
        repositories: {
            database: ctx.repositories.user,
            cache: ctx.repositories.cache,
            hashing: ctx.repositories.hashing
        }
    });

    const session = await CreateAuthSessionService({
        userId: user.id,
        repositories: {
            user: ctx.repositories.user,
            database: ctx.repositories.session,
            cache: ctx.repositories.cache
        }
    })

    return session;
}

export {
    loginUserController
}