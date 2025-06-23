type IBaseModel<Entity, KeyId extends keyof Entity> = {
  create: (id: Entity[KeyId], data: Omit<Entity, "id">) => Promise<Entity>;
  find: (id: Entity[KeyId]) => Promise<Entity | null>;
  update: (
    id: Entity[KeyId],
    data: Partial<Omit<Entity, "id">>
  ) => Promise<Entity>;
  delete: (id: Entity[KeyId]) => Promise<void>;
};

export type { IBaseModel };
