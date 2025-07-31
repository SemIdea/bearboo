import { BaseEntity } from "../base/entity";
import { IReadVerifyTokenByTokenDTO, IVerifyTokenEntity } from "./DTO";

class VerifyTokenEntityClass extends BaseEntity<IVerifyTokenEntity, {}> {
  async readByToken({
    token,
    repositories
  }: IReadVerifyTokenByTokenDTO): Promise<IVerifyTokenEntity | null> {
    const tokenEntity = await repositories.database.readByToken(token);

    if (!tokenEntity) return null;

    return tokenEntity;
  }
}

const VerifyTokenEntity = new VerifyTokenEntityClass({});

export { VerifyTokenEntity };
