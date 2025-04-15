type ICacheRepositoryAdapter = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ex?: number) => Promise<void>;
  del: (key: string) => Promise<void>;
  mget: (keys: string[]) => Promise<string[]>;
  mset: (keys: string[], values: string[], ex?: number) => Promise<void>;
};

export type { ICacheRepositoryAdapter };
