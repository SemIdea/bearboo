import { CommentEntity } from "./entity";

type ICommentEntity = {
  postId: string;
  userId: string;
  content: string;
};

type ICommentModel = {
  create: (id: string, data: ICommentEntity) => Promise<CommentEntity>;
  findById: (id: string) => Promise<CommentEntity | null>;
  findAllByPostId: (postId: string) => Promise<CommentEntity[] | null>;
  update: (id: string, data: Partial<ICommentEntity>) => Promise<CommentEntity>;
  delete: (id: string) => Promise<void>;
};

type ICreateCommentDTO = {
  id: string;
  data: {
    postId: string;
    userId: string;
    content: string;
  };
  repositories: {
    database: ICommentModel;
  };
};

type IFindCommentByIdDTO = {
  id: string;
  repositories: {
    database: ICommentModel;
  };
};

type IFindAllByPostIdDTO = {
  postId: string;
  repositories: {
    database: ICommentModel;
  };
};

type IUpdateCommentDTO = {
  id: string;
  data: {
    content: string;
  };
  repositories: {
    database: ICommentModel;
  };
};

type IDeleteCommentDTO = {
  id: string;
  repositories: {
    database: ICommentModel;
  };
};

export type {
  ICommentEntity,
  ICommentModel,
  ICreateCommentDTO,
  IFindCommentByIdDTO,
  IFindAllByPostIdDTO,
  IUpdateCommentDTO,
  IDeleteCommentDTO
};
