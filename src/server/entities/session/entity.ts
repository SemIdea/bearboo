import {
  sessionAccessTokenCacheKey,
  sessionCacheKey,
  SessionCacheTTL,
  sessionRefreshTokenCacheKey,
} from "@/constants/cache/session";
import {
  ICreateSessionDTO,
  IFindSessionByAccessTokenDTO,
  IFindSessionByRefreshTokenDTO,
  IRefreshSessionDTO,
  ISessionEntity,
} from "./DTO";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

class SessionEntity implements ISessionEntity {
  constructor(
    public id: string,
    public userId: string,
    public accessToken: string,
    public refreshToken: string
  ) {}

  private static async cacheSession(
    session: SessionEntity,
    repositories: {
      cache: ICacheRepositoryAdapter;
    }
  ) {
    const { id, accessToken, refreshToken } = session;

    console.log(session);

    await repositories.cache.mset(
      [
        sessionCacheKey(id),
        sessionAccessTokenCacheKey(accessToken),
        sessionRefreshTokenCacheKey(refreshToken),
      ],
      [JSON.stringify(session), id, id],
      SessionCacheTTL
    );
  }

  private static async resolveSessionFromIndex(
    indexKey: string,
    repositories: any
  ): Promise<SessionEntity | null> {
    const sessionId = await repositories.cache.get(indexKey);
    if (!sessionId) return null;

    const cachedSession = await repositories.cache.get(
      sessionCacheKey(sessionId)
    );
    if (cachedSession) return JSON.parse(cachedSession) as SessionEntity;

    const session = (await repositories.database.findById(
      sessionId
    )) as SessionEntity;
    if (!session) return null;

    await SessionEntity.cacheSession(session, repositories);

    return session;
  }

  static async create({ id, data, repositories }: ICreateSessionDTO) {
    const { userId, accessToken, refreshToken } = data;
    const newSession = new SessionEntity(id, userId, accessToken, refreshToken);

    const session = await repositories.database.create(id, newSession);

    await SessionEntity.cacheSession(session, repositories);

    return session;
  }

  static async findByAccessToken({
    accessToken,
    repositories,
  }: IFindSessionByAccessTokenDTO) {
    return await SessionEntity.resolveSessionFromIndex(
      sessionAccessTokenCacheKey(accessToken),
      repositories
    );
  }

  static async findByRefreshToken({
    refreshToken,
    repositories,
  }: IFindSessionByRefreshTokenDTO) {
    return await SessionEntity.resolveSessionFromIndex(
      sessionRefreshTokenCacheKey(refreshToken),
      repositories
    );
  }

  static async refreshSession({
    id,
    refreshToken,
    accessToken,
    newRefreshToken,
    newAccessToken,
    repositories,
  }: IRefreshSessionDTO) {
    await Promise.all([
      repositories.cache.del(sessionAccessTokenCacheKey(accessToken)),
      repositories.cache.del(sessionRefreshTokenCacheKey(refreshToken)),
    ]);

    const session = await repositories.database.update(id, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

    await SessionEntity.cacheSession(session, repositories);

    return session;
  }
}

export { SessionEntity };
