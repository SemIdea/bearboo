import { BaseEntity } from "../base/entity";
import {
  IReadSessionByAccessTokenDTO,
  IReadSessionByRefreshTokenDTO,
  IRefreshSessionDTO,
  ISessionEntity,
  ISessionModel
} from "./DTO";
import {
  sessionAccessTokenCacheKey,
  sessionCacheKey,
  SessionCacheTTL
} from "@/constants/cache/session";

class SessionEntityClass extends BaseEntity<ISessionEntity, ISessionModel> {
  async readByAccessToken({
    accessToken,
    repositories
  }: IReadSessionByAccessTokenDTO) {
    const cachedSession = await this.readCachedEntityByIndex({
      indexName: "accessToken",
      indexValue: accessToken,
      repositories
    });

    if (cachedSession) return cachedSession;

    const session = await repositories.database.readByAccessToken(accessToken);

    if (!session) return null;

    await this.cacheEntity({
      data: session,
      repositories: {
        cache: repositories.cache!
      }
    });

    return session;
  }

  async readByRefreshToken({
    refreshToken,
    repositories
  }: IReadSessionByRefreshTokenDTO) {
    const cachedSession = await this.readCachedEntityByIndex({
      indexName: "refreshToken",
      indexValue: refreshToken,
      repositories
    });

    if (cachedSession) return cachedSession;

    const session =
      await repositories.database.readByRefreshToken(refreshToken);

    if (!session) return null;

    await this.cacheEntity({
      data: session,
      repositories: {
        cache: repositories.cache!
      }
    });

    return session;
  }

  async refreshSession({
    id,
    accessToken,
    newRefreshToken,
    newAccessToken,
    repositories
  }: IRefreshSessionDTO) {
    await this.bulkDeleteCachedEntities({
      indexes: [id, accessToken],
      repositories
    });

    const session = await repositories.database.update(id, {
      refreshToken: newRefreshToken,
      accessToken: newAccessToken
    });

    await this.cacheEntity({
      data: session,
      repositories: {
        cache: repositories.cache!
      }
    });

    return session;
  }

  constructor() {
    super({
      cache: {
        key: sessionCacheKey("%id%"),
        ttl: SessionCacheTTL
      },
      index: {
        accessToken: {
          key: sessionAccessTokenCacheKey("%accessToken%"),
          ttl: SessionCacheTTL
        }
      }
    });
  }
}

const SessionEntity = new SessionEntityClass();

export { SessionEntity };
