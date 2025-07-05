import { BaseEntity } from "../base/entity";
import { IReadTokenByTokenDTO, ITokenEntity } from "./DTO";

class TokenEntityClass extends BaseEntity<ITokenEntity, {}> {
  async readByToken({
    token,
    repositories
  }: IReadTokenByTokenDTO): Promise<ITokenEntity | null> {
    const tokenEntity = await repositories.database.readByToken(token);

    if (!tokenEntity) return null;

    return tokenEntity;
  }
}

const TokenEntity = new TokenEntityClass({});

export { TokenEntity };
