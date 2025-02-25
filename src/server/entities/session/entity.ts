import {
  ICreateSessionDTO,
  IFindSessionByAccessTokenDTO,
  IFindSessionByRefreshTokenDTO,
  IRefreshSessionDTO,
  ISessionEntity,
} from "./DTO";

class SessionEntity implements ISessionEntity {
  constructor(
    public id: string,
    public userId: string,
    public accessToken: string,
    public refreshToken: string,
  ) {}

  static async create({ id, data, repositories }: ICreateSessionDTO) {
    const { userId, accessToken, refreshToken } = data;
    const newSession = new SessionEntity(id, userId, accessToken, refreshToken);

    const session = await repositories.database.create(id, newSession);

    return session;
  }

  static async findByAccessToken({
    accessToken,
    repositories,
  }: IFindSessionByAccessTokenDTO) {
    const cachedSession = await repositories.cache.get(
      `session:accessToken:${accessToken}`,
    );

    if (cachedSession) return JSON.parse(cachedSession) as ISessionEntity;

    const session = await repositories.database.findByAccessToken(accessToken);

    if (!session) return null;

    await repositories.cache.set(
      `session:accessToken:${accessToken}`,
      JSON.stringify(session),
      60 * 15,
    );

    return session;
  }

  static async findByRefreshToken({
    refreshToken,
    repositories,
  }: IFindSessionByRefreshTokenDTO) {
    const session = repositories.database.findByRefreshToken(refreshToken);

    if (!session) return null;

    return session;
  }

  static async refreshSession({
    id,
    refreshToken,
    accessToken,
    repositories,
  }: IRefreshSessionDTO) {
    const session = repositories.database.update(id, {
      refreshToken,
      accessToken,
    });

    if (!session) return null;

    return session;
  }
}

export { SessionEntity };
