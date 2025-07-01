import { isFeatureEnabled } from "@/lib/featureFlags";
import { BaseEntity } from "../base/entity";
import {
  IReadSessionByAccessTokenDTO,
  IReadSessionByRefreshTokenDTO,
  IRefreshSessionDTO,
  ISessionEntity,
  ISessionModel
} from "./DTO";
import { SessionCacheTTL } from "@/constants/cache/session";

class SessionEntityClass extends BaseEntity<
  ISessionEntity,
  ISessionModel,
  "session",
  "accessToken" | "refreshToken"
> {
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
    refreshToken,
    newRefreshToken,
    newAccessToken,
    repositories
  }: IRefreshSessionDTO) {
    const session = await repositories.database.update(id, {
      refreshToken: newRefreshToken,
      accessToken: newAccessToken
    });

    await this.deleteCachedEntity({
      data: {
        ...session,
        accessToken,
        refreshToken
      },
      repositories: {
        cache: repositories.cache!
      }
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
      shouldCache: isFeatureEnabled("enableSessionCaching"),
      cache: {
        key: "session:%id%",
        ttl: SessionCacheTTL
      },
      index: {
        accessToken: {
          key: "session:accessToken:%accessToken%",
          ttl: SessionCacheTTL
        },
        refreshToken: {
          key: "session:refreshToken:%refreshToken%",
          ttl: SessionCacheTTL
        }
      }
    });
  }
}

const SessionEntity = new SessionEntityClass();

export { SessionEntity };
