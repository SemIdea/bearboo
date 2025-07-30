import { IEntityDatabaseRepository } from "../base/entity";

type ICommentEntity = {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

type ICommentEntityWithUser = ICommentEntity & {
  user: {
    name: string;
  };
};

type ICommentExtraRepositories = {
  readAllByPostId: (postId: string) => Promise<ICommentEntityWithUser[] | null>;
  readAllByUserId: (userId: string) => Promise<ICommentEntity[] | null>;
};

type ICommentModel = IEntityDatabaseRepository<
  ICommentEntity,
  ICommentExtraRepositories
>;

type IReadAllByPostIdDTO = {
  postId: string;
  repositories: {
    database: ICommentModel;
  };
};

type IReadAllByUserIdDTO = {
  userId: string;
  repositories: {
    database: ICommentModel;
  };
};

export type {
  ICommentEntity,
  ICommentEntityWithUser,
  ICommentModel,
  IReadAllByPostIdDTO,
  IReadAllByUserIdDTO
};
