import {
  CreateDTO,
  DeleteDTO,
  FindDTO,
  UpdateDTO,
  WithRepositories
} from "../base/DTO";
import { IBaseModel } from "../base/model";
import { CommentEntity } from "./entity";

type ICommentEntity = {
  postId: string;
  userId: string;
  content: string;
};

type ICommentModel = IBaseModel<CommentEntity, "id"> & {
  findAllByPostId: (postId: string) => Promise<CommentEntity[] | null>;
  findAllByUserId: (userId: string) => Promise<CommentEntity[] | null>;
};

type ICreateCommentDTO = CreateDTO<
  CommentEntity,
  {
    database: ICommentModel;
  }
>;

type IFindCommentByIdDTO = FindDTO<{
  database: ICommentModel;
}>;

type IFindAllByPostIdDTO = {
  postId: string;
} & WithRepositories<{
  database: ICommentModel;
}>;

type IFindAllByUserIdDTO = {
  userId: string;
  repositories: {
    database: ICommentModel;
  };
};

type IUpdateCommentDTO = UpdateDTO<
  ICommentEntity,
  {
    database: ICommentModel;
  }
>;

type IDeleteCommentDTO = DeleteDTO<{
  database: ICommentModel;
}>;

export type {
  ICommentEntity,
  ICommentModel,
  ICreateCommentDTO,
  IFindCommentByIdDTO,
  IFindAllByPostIdDTO,
  IFindAllByUserIdDTO,
  IUpdateCommentDTO,
  IDeleteCommentDTO
};
