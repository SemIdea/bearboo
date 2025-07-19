import { ICommentModel } from "@/server/entities/comment/DTO";
import { IPostModel } from "@/server/entities/post/DTO";
import { ISessionModel } from "@/server/entities/session/DTO";
import { IUserModel } from "@/server/entities/user/DTO";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

import { PrismaCommentModel } from "@/server/entities/comment/repositories/prisma";
import { PrismaPostModel } from "@/server/entities/post/repositories/prisma";
import { PrismaSessionModel } from "@/server/entities/session/repositories/prisma";
import { PrismaUserModel } from "@/server/entities/user/repositories/prisma";
import { RedisCacheRepository } from "@/server/integrations/repositories/cache/implementations/redis";
import { ITokenModel } from "../entities/token/DTO";
import { PrismaTokenModel } from "../entities/token/repositories/prisma";

type IRepositories = {
  cache: ICacheRepositoryAdapter;
  user: IUserModel;
  session: ISessionModel;
  post: IPostModel;
  comment: ICommentModel;
  token: ITokenModel;
};

const repositories: IRepositories = {
  cache: new RedisCacheRepository(),
  user: new PrismaUserModel(),
  session: new PrismaSessionModel(),
  post: new PrismaPostModel(),
  comment: new PrismaCommentModel(),
  token: new PrismaTokenModel()
};

export { repositories };

export type { IRepositories };
