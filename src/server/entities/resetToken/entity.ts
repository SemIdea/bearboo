import { BaseEntity } from "../base/entity";
import {
  IReadResetTokenByTokenDTO,
  IReadResetTokenByUserIdDTO,
  IResetTokenEntity
} from "./DTO";

class ResetTokenEntityClass extends BaseEntity<IResetTokenEntity, {}> {
  async readByToken({
    token,
    repositories
  }: IReadResetTokenByTokenDTO): Promise<IResetTokenEntity | null> {
    const tokenEntity = await repositories.database.readByToken(token);

    if (!tokenEntity) return null;

    return tokenEntity;
  }

  async readByUserId({ userId, repositories }: IReadResetTokenByUserIdDTO) {
    const tokenEntity = await repositories.database.readByUserId(userId);

    if (!tokenEntity) return null;

    return tokenEntity;
  }
}

const ResetTokenEntity = new ResetTokenEntityClass({});

export { ResetTokenEntity };
