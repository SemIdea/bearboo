import { BaseEntity } from "../base/entity";
import { IReadResetTokenByTokenDTO, IResetTokenEntity } from "./DTO";

class ResetTokenEntityClass extends BaseEntity<IResetTokenEntity, {}> {
  async readByToken({
    token,
    repositories
  }: IReadResetTokenByTokenDTO): Promise<IResetTokenEntity | null> {
    const tokenEntity = await repositories.database.readByToken(token);

    if (!tokenEntity) return null;

    return tokenEntity;
  }
}

const ResetTokenEntity = new ResetTokenEntityClass({});

export { ResetTokenEntity };
