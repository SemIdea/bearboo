type IEntityDatabaseRepository<Entity, R extends IEntityRepositoriesBasic> = {
  create: (
    id: string,
    data: Omit<Entity, "id" | "createdAt" | "updatedAt">
  ) => Promise<Entity>;
  read: (id: string) => Promise<Entity | null>;
  update: (id: string, data: Partial<Omit<Entity, "id">>) => Promise<Entity>;
  delete: (id: string) => Promise<boolean>;
  bulkCreate?: (data: Entity[]) => Promise<string[]>;
  bulkRead?: (ids: string[]) => Promise<Array<Entity | null>>;
  bulkUpdate?: (data: Partial<Entity>[]) => Promise<string[]>;
  bulkDelete?: (ids: string[]) => Promise<string[]>;
} & R;

type IEntityCacheRepository = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ttl?: number) => Promise<boolean>;
  del: (key: string) => Promise<boolean>;
  // flush: () => Promise<boolean>;
  // size: () => Promise<number>;
  bulkGet?: (keys: string[]) => Promise<string[]>;
  bulkSet: (
    values: {
      key: string;
      value: string;
      ttl?: number;
    }[]
  ) => Promise<boolean>;
  bulkDel: (keys: string[]) => Promise<boolean>;
};

type IEntityBasic = {
  id: string;
};

type IEntityRepositoriesBasic = Record<string, (...args: any) => any>;

type IEntityRepositories<Entity, Repos extends IEntityRepositoriesBasic> = {
  database: IEntityDatabaseRepository<Entity, Repos>;
  cache?: IEntityCacheRepository;
};

type IEntityCreateReq<Entity, Repos extends IEntityRepositoriesBasic> = {
  id: string;
  data: Omit<Entity, "id" | "createdAt" | "updatedAt">;
  repositories: IEntityRepositories<Entity, Repos>;
};

type IEntityReadReq<Entity, Repos extends IEntityRepositoriesBasic> = {
  id: string;
  repositories: IEntityRepositories<Entity, Repos>;
};

type IEntityUpdateReq<Entity, Repos extends IEntityRepositoriesBasic> = {
  id: string;
  data: Partial<Omit<Entity, "id">>;
  repositories: IEntityRepositories<Entity, Repos>;
};

type IEntityDeleteReq<Entity, Repos extends IEntityRepositoriesBasic> = {
  id: string;
  data: Entity;
  repositories: IEntityRepositories<Entity, Repos>;
};

type ICacheEntityReq<Entity> = {
  data: Entity;
  repositories: {
    cache: IEntityCacheRepository;
  };
};

type IReadCachedEntityReq = {
  id: string;
  repositories: {
    cache: IEntityCacheRepository;
  };
};

type IReadCachedEntityByIndexReq<Indexes extends string> = {
  indexName: Indexes;
  indexValue: string;
  repositories: {
    cache: IEntityCacheRepository;
  };
};

type IDeleteCacheEntityReq<Entity> = {
  data: Entity;
  repositories: {
    cache: IEntityCacheRepository;
  };
};

type CacheKey<Base extends string> = `${Base}:%id%`;

type IndexKey<
  Base extends string,
  Index extends string
> = `${Base}:${Index}:%${Index}%`;

type CacheConfig<Base extends string> = {
  key: CacheKey<Base>;
  ttl: number;
};

type IndexConfig<Base extends string, Indexes extends string> = {
  [K in Indexes]: {
    key: IndexKey<Base, K>;
    ttl: number;
  };
};

class BaseEntity<
  Entity extends IEntityBasic,
  Repos extends IEntityRepositoriesBasic,
  BaseIndex extends string = "",
  Indexes extends keyof Entity & string = never
> {
  cache?: CacheConfig<BaseIndex>;
  index?: IndexConfig<BaseIndex, Indexes>;
  shouldCache?: boolean;

  constructor({
    cache,
    index,
    shouldCache
  }: {
    cache?: CacheConfig<BaseIndex>;
    index?: IndexConfig<BaseIndex, Indexes>;
    shouldCache?: boolean;
  }) {
    this.cache = cache;
    this.index = index;
    this.shouldCache = shouldCache;
  }

  resolveKey(template: string, data: Entity) {
    return template.replace(
      /%(\w+)%/g,
      (_, key) => data[key as keyof Entity]?.toString() || ""
    );
  }

  async cacheEntity({
    data,
    repositories
  }: ICacheEntityReq<Entity>): Promise<void> {
    if (!this.cache || !repositories.cache || !this.shouldCache) return;

    const keysToCreate = [
      {
        key: this.resolveKey(this.cache.key, data),
        value: JSON.stringify(data),
        ttl: this.cache.ttl
      }
    ];

    if (this.index) {
      for (const [_key, index] of Object.entries(this.index) as [
        string,
        { key: string; ttl: number }
      ][]) {
        keysToCreate.push({
          key: this.resolveKey(index.key, data),
          value: data.id,
          ttl: index.ttl
        });
      }
    }

    await repositories.cache.bulkSet(keysToCreate);
  }

  async readCachedEntity({
    id,
    repositories
  }: IReadCachedEntityReq): Promise<Entity | null> {
    if (!this.cache || !repositories.cache || !this.shouldCache) return null;

    const indexPattern = this.cache.key;

    const key = indexPattern.replace(/%id%/, id);

    const cachedData = await repositories.cache.get(key);

    if (!cachedData) return null;

    return JSON.parse(cachedData) as Entity;
  }

  async readCachedEntityByIndex({
    indexName,
    indexValue,
    repositories
  }: IReadCachedEntityByIndexReq<Indexes>): Promise<Entity | null> {
    if (!this.index || !this.index[indexName] || !this.shouldCache) return null;

    const indexPattern = this.index[indexName].key;

    const indexKey = indexPattern.replace(`%${indexName}%`, indexValue);

    const entityId = await repositories.cache.get(indexKey);

    if (!entityId) return null;

    const fullKey = this.cache?.key.replace(/%(\w+)%/g, (_, field: string) => {
      return field === "id" ? entityId : "";
    });

    if (!fullKey) return null;

    const cachedEntity = await repositories.cache.get(fullKey);

    if (!cachedEntity) return null;

    try {
      return JSON.parse(cachedEntity) as Entity;
    } catch (err) {
      console.error("Error parsing cached entity", err);

      return null;
    }
  }

  async deleteCachedEntity({
    data,
    repositories
  }: IDeleteCacheEntityReq<Entity>): Promise<void> {
    if (!this.cache || !repositories.cache || !this.shouldCache) return;

    const mainKey = this.resolveKey(this.cache.key, data);
    const keysToDelete = [mainKey];

    if (this.index) {
      const indexKeys = Object.values(this.index).map((index) =>
        this.resolveKey((index as { key: string }).key, data)
      );
      keysToDelete.push(...indexKeys);
    }

    await repositories.cache.bulkDel(keysToDelete);
  }

  async create({ id, data, repositories }: IEntityCreateReq<Entity, Repos>) {
    const entity = await repositories.database.create(id, data);

    await this.cacheEntity({
      data: {
        ...data,
        id
      } as Entity,
      repositories: {
        cache: repositories.cache!
      }
    });

    return entity;
  }

  async read({ id, repositories }: IEntityReadReq<Entity, Repos>) {
    const cachedEntity = await this.readCachedEntity({
      id,
      repositories: {
        cache: repositories.cache!
      }
    });

    if (cachedEntity) return cachedEntity;

    const entity = await repositories.database.read(id);

    if (!entity) return null;

    await this.cacheEntity({
      data: entity,
      repositories: {
        cache: repositories.cache!
      }
    });

    return entity;
  }

  async update({ id, data, repositories }: IEntityUpdateReq<Entity, Repos>) {
    const entity = await repositories.database.update(id, data);

    await this.cacheEntity({
      data: entity,
      repositories: {
        cache: repositories.cache!
      }
    });

    return entity;
  }

  async delete({ id, data, repositories }: IEntityDeleteReq<Entity, Repos>) {
    await this.deleteCachedEntity({
      data,
      repositories: {
        cache: repositories.cache!
      }
    });

    return await repositories.database.delete(id);
  }
}

export { BaseEntity };
export type {
  IEntityBasic,
  IEntityRepositories,
  IEntityCreateReq,
  IEntityReadReq,
  IEntityUpdateReq,
  IEntityDeleteReq,
  IEntityDatabaseRepository,
  IEntityCacheRepository
};
