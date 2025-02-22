type ICacheRepositoryAdapter = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ex?: number) => Promise<void>;
  del: (key: string) => Promise<void>;
};

export type { ICacheRepositoryAdapter };
