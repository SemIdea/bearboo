import { IBaseContextDTO } from "./createContext";

type DomainInput<TInput = {}> = {
  ctx: IBaseContextDTO;
  input: TInput;
};

export type { DomainInput };
