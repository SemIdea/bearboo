import {
  ICacheSessionDTO,
  ICreateSessionDTO,
  IDeletePostDTO,
  IFindSessionByAccessTokenDTO,
  IFindSessionByIdDTO,
  IFindSessionByRefreshTokenDTO,
  IRefreshSessionDTO,
  IResolveSessionFromIndexDTO,
  ISessionEntity
} from "./DTO";
import { isFeatureEnabled } from "@/lib/featureFlags";
import {
  sessionAccessTokenCacheKey,
  sessionCacheKey,
  SessionCacheTTL,
  sessionRefreshTokenCacheKey
} from "@/constants/cache/session";

class SessionEntity implements ISessionEntity {
  constructor(
    public id: string,
    public userId: string,
    public accessToken: string,
    public refreshToken: string
  ) {}

  private static async cacheSession({
    session,
    repositories
  }: ICacheSessionDTO) {
    if (!isFeatureEnabled("enableSessionCaching")) return;
    const { id, accessToken, refreshToken } = session;

    await repositories.cache.mset(
      [
        sessionCacheKey(id),
        sessionAccessTokenCacheKey(accessToken),
        sessionRefreshTokenCacheKey(refreshToken)
      ],
      [JSON.stringify(session), id, id],
      SessionCacheTTL
    );
  }

  private static async resolveSessionFromIndex({
    indexKey,
    indexKeyCaller,
    findOnDatabase,
    repositories
  }: IResolveSessionFromIndexDTO) {
    const lookupCacheKey = indexKeyCaller(indexKey);
    const cachedIndexValue = await repositories.cache.get(lookupCacheKey);

    if (cachedIndexValue) {
      try {
        const maybeSession = JSON.parse(cachedIndexValue) as SessionEntity;

        if (maybeSession.id) return maybeSession;
      } catch (error) {
        const fallbackCacheKey = sessionCacheKey(cachedIndexValue);
        const fallbackCacheSession =
          await repositories.cache.get(fallbackCacheKey);

        if (fallbackCacheSession)
          return JSON.parse(fallbackCacheSession) as SessionEntity;
      }
    }

    const sessionFromDb = await findOnDatabase(indexKey);

    if (!sessionFromDb) return null;

    await SessionEntity.cacheSession({
      session: sessionFromDb,
      repositories
    });

    return sessionFromDb;
  }

  static async create({ id, data, repositories }: ICreateSessionDTO) {
    const { userId, accessToken, refreshToken } = data;
    const newSession = new SessionEntity(id, userId, accessToken, refreshToken);

    const session = await repositories.database.create(id, newSession);

    await SessionEntity.cacheSession({
      session,
      repositories
    });

    return session;
  }

  static async find({ id, repositories }: IFindSessionByIdDTO) {
    const cachedSession = await repositories.cache.get(sessionCacheKey(id));

    if (cachedSession) {
      return JSON.parse(cachedSession) as SessionEntity;
    }

    const sessionFromDb = await repositories.database.find(id);

    if (!sessionFromDb) return null;

    await SessionEntity.cacheSession({
      session: sessionFromDb,
      repositories
    });

    return sessionFromDb;
  }

  static async findByAccessToken({
    accessToken,
    repositories
  }: IFindSessionByAccessTokenDTO) {
    return await SessionEntity.resolveSessionFromIndex({
      indexKey: accessToken,
      indexKeyCaller: sessionAccessTokenCacheKey,
      findOnDatabase: repositories.database.findByAccessToken,
      repositories
    });
  }

  static async findByRefreshToken({
    refreshToken,
    repositories
  }: IFindSessionByRefreshTokenDTO) {
    return await SessionEntity.resolveSessionFromIndex({
      indexKey: refreshToken,
      indexKeyCaller: sessionRefreshTokenCacheKey,
      findOnDatabase: repositories.database.findByRefreshToken,
      repositories
    });
  }

  static async refreshSession({
    id,
    refreshToken,
    accessToken,
    newRefreshToken,
    newAccessToken,
    repositories
  }: IRefreshSessionDTO) {
    await repositories.cache.mdel([
      sessionAccessTokenCacheKey(accessToken),
      sessionRefreshTokenCacheKey(refreshToken)
    ]);

    const session = await repositories.database.update(id, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

    await SessionEntity.cacheSession({
      session,
      repositories
    });

    return session;
  }

  static async delete({ id, repositories }: IDeletePostDTO) {
    await repositories.cache.mdel([
      sessionCacheKey(id),
      sessionAccessTokenCacheKey(id),
      sessionRefreshTokenCacheKey(id)
    ]);

    return await repositories.database.delete(id);
  }
}

export { SessionEntity };
