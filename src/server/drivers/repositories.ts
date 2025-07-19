import { RedisCacheRepository } from "../integrations/repositories/cache/implementations/redis";
import { PrismaUserModel } from "../entities/user/repositories/prisma";
import { PrismaSessionModel } from "../entities/session/repositories/prisma";
import { BycryptPasswordHashingHelper } from "../integrations/helpers/passwordHashing/implementations/bycrypt";
import { PrismaPostModel } from "../entities/post/repositories/prisma";
import { PrismaCommentModel } from "../entities/comment/repositories/prisma";

// Singleton instances
const cacheRepository = new RedisCacheRepository();
const userRepository = new PrismaUserModel();
const sessionRepository = new PrismaSessionModel();
const passwordHashingHelper = new BycryptPasswordHashingHelper();
const postRepository = new PrismaPostModel();
const commentRepository = new PrismaCommentModel();

export {
  cacheRepository,
  userRepository,
  sessionRepository,
  passwordHashingHelper,
  postRepository,
  commentRepository
};
