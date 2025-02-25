import { IUserModel } from "@/server/entities/user/DTO"
import { IPasswordHashingHelperAdapter } from "@/server/integrations/helpers/passwordHashing/adapter"
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter"

type ILoginUserDTO = {
    email: string,
    password: string,
    repositories: ILoginUserRepositories
}

type ILoginUserRepositories = {
    database: IUserModel,
    cache: ICacheRepositoryAdapter,
    hashing: IPasswordHashingHelperAdapter
}

export type {
    ILoginUserDTO,
    ILoginUserRepositories
}
