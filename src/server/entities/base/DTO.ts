type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type WithRepositories<T extends object> = {
  repositories: {
    [key in keyof T]: Expand<T[key]>;
  };
};

type BaseDTO<Repos extends object = object> = {
  id: string;
} & WithRepositories<Repos>;

type CreateDTO<Data, Repos extends object = object> = BaseDTO<Repos> & {
  data: Expand<Data>;
};

type FindDTO<Repos extends object = object> = BaseDTO<Repos>;

type UpdateDTO<Data, Repos extends object = object> = BaseDTO<Repos> & {
  data: Expand<Data>;
};

type DeleteDTO<Repos extends object = object> = BaseDTO<Repos>;

export type { CreateDTO, FindDTO, UpdateDTO, DeleteDTO, WithRepositories };
