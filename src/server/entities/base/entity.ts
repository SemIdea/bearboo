type IEntityDatabaseRepository<Entity, R extends IEntityRepositoriesBasic> = {
  create: (id: string, data: Omit<Entity, "id">) => Promise<Entity>;
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
  bulkSet?: (
    values: {
      key: string;
      value: string;
      ttl?: number;
    }[]
  ) => Promise<boolean>;
  bulkDel?: (keys: string[]) => Promise<boolean>;
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
  data: Omit<Entity, "id">;
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
  repositories: IEntityRepositories<Entity, Repos>;
};

type ICacheEntityReq<Entity> = {
  data: Entity;
  repositories: {
    cache: IEntityCacheRepository;
  };
};

class BaseEntity<
  Entity extends IEntityBasic,
  Repos extends IEntityRepositoriesBasic
> {
  cache?: {
    key: string;
    ttl: number;
  };
  index?: Record<string, { key: string; ttl: number }>;
  constructor({
    cache,
    index
  }: {
    cache?: {
      key: string;
      ttl: number;
    };
    index?: Record<string, { key: string; ttl: number }>;
  }) {
    this.cache = cache;
    this.index = index;
  }

  async cacheEntity({ data, repositories }: ICacheEntityReq<Entity>) {
    if (!this.cache || !repositories.cache) return;

    const key = this.cache.key.replace(/%(\w+)%/g, (_, field: string) => {
      return (data as Record<string, unknown>)[field]?.toString() || "";
    });

    if (this.index) {
      for (const [indexKey, indexValue] of Object.entries(this.index)) {
        const indexCacheKey = indexValue.key.replace(
          /%(\w+)%/g,
          (_, field: string) => {
            return (data as Record<string, unknown>)[field]?.toString() || "";
          }
        );

        await repositories.cache.set(indexCacheKey, data.id, indexValue.ttl);
      }
    }

    await repositories.cache.set(key, JSON.stringify(data), this.cache.ttl);
  }

  async readCachedEntity({
    index,
    repositories
  }: {
    index: string;
    repositories: { cache: IEntityCacheRepository };
  }): Promise<Entity | null> {
    if (!this.cache || !repositories.cache) return null;

    const key = this.cache.key.replace(/%(\w+)%/g, (_, field: string) => {
      return index;
    });

    const cachedData = await repositories.cache.get(key);

    if (!cachedData) return null;

    try {
      return JSON.parse(cachedData) as Entity;
    } catch (error) {
      console.error("Failed to parse cached entity:", error);

      return null;
    }
  }

  async readCachedEntityByIndex({
    indexName,
    indexValue,
    repositories
  }: {
    indexName: string;
    indexValue: string;
    repositories: { cache: IEntityCacheRepository };
  }): Promise<Entity | null> {
    if (!this.index || !this.index[indexName]) return null;

    const indexPattern = this.index[indexName].key;

    const indexKey = indexPattern.replace(/%(\w+)%/g, (_, field: string) => {
      return field === indexName ? indexValue : "";
    });

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
    index,
    repositories
  }: {
    index: string;
    repositories: { cache: IEntityCacheRepository };
  }): Promise<boolean> {
    if (!this.cache || !repositories.cache) return false;

    const key = this.cache.key.replace(/%(\w+)%/g, (_, field: string) => {
      return index;
    });

    return await repositories.cache.del(key);
  }

  async deleteCachedEntityByIndex({
    indexName,
    indexValue,
    repositories
  }: {
    indexName: string;
    indexValue: string;
    repositories: { cache: IEntityCacheRepository };
  }): Promise<boolean> {
    if (!this.index || !this.index[indexName]) return false;

    const indexPattern = this.index[indexName].key;

    const indexKey = indexPattern.replace(/%(\w+)%/g, (_, field: string) => {
      return field === indexName ? indexValue : "";
    });

    return await repositories.cache.del(indexKey);
  }

  async bulkDeleteCachedEntities({
    indexes,
    repositories
  }: {
    indexes: string[];
    repositories: { cache: IEntityCacheRepository };
  }): Promise<boolean> {
    if (!this.cache || !repositories.cache || !repositories.cache.bulkDel)
      return false;

    const keys = indexes.map((index) =>
      this.cache!.key.replace(/%(\w+)%/g, (_, field: string) => {
        return index;
      })
    );

    return await repositories.cache.bulkDel(keys);
  }

  async create({ id, data, repositories }: IEntityCreateReq<Entity, Repos>) {
    await this.cacheEntity({
      data: {
        ...data,
        id
      } as Entity,
      repositories: {
        cache: repositories.cache!
      }
    });

    return await repositories.database.create(id, data);
  }

  async read({ id, repositories }: IEntityReadReq<Entity, Repos>) {
    const cachedEntity = await this.readCachedEntity({
      index: id,
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
    await this.cacheEntity({
      data: {
        ...data,
        id
      } as Entity,
      repositories: {
        cache: repositories.cache!
      }
    });

    return await repositories.database.update(id, data);
  }

  async delete({ id, repositories }: IEntityDeleteReq<Entity, Repos>) {
    await this.deleteCachedEntity({
      index: id,
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
