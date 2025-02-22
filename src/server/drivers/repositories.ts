import { RedisCacheRepository } from "../integrations/repositories/cache/implementations/redis";
import { PrismaUserModel } from "../entities/user/repositories/prisma";
import { PrismaSessionModel } from "../entities/session/repositories/prisma";
import { BycryptPasswordHashingHelper } from "../integrations/helpers/passwordHashing/implementations/bycrypt";

// Singleton instances
export const cacheRepository = new RedisCacheRepository();
export const userRepository = new PrismaUserModel();
export const sessionRepository = new PrismaSessionModel();
export const passwordHashingHelper = new BycryptPasswordHashingHelper();
