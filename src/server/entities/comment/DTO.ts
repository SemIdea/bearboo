import { Comment } from "@prisma/client";

type ICommentEntity = {
  postId: string;
  userId: string;
  content: string;
};

type ICommentModel = {
  create: (id: string, data: ICommentEntity) => Promise<Comment>;
  findById: (id: string) => Promise<Comment | null>;
  findAllByPostId: (postId: string) => Promise<Comment[] | null>;
  update: (
    id: string,
    data: Partial<ICommentEntity>
  ) => Promise<Comment | null>;
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
  IDeleteCommentDTO
};
