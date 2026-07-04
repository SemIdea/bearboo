import { IBaseContextDTO } from "./createContext";

type DomainInput<TInput = {}> = TInput & {
  ctx: IBaseContextDTO;
};

export type { DomainInput };
