import { IBaseContextDTO } from "./createContext";

type DomainInput<TInput = {}> = {
  ctx: IBaseContextDTO;
  input: TInput;
};

type DomainHandler<TInput, TOutput> = (
  params: DomainInput<TInput>
) => Promise<TOutput>;

function createDomain<TInput, TOutput>(
  handler: DomainHandler<TInput, TOutput>
): DomainHandler<TInput, TOutput> {
  return handler;
}

export { createDomain };
export type { DomainInput, DomainHandler };
