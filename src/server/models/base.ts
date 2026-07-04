type IEntityBasic = {
  id: string;
};

type IPrismaDelegate<Entity extends IEntityBasic> = {
  create(args: {
    data: { id: string } & Omit<Entity, "id" | "createdAt" | "updatedAt">;
  }): Promise<Entity>;
  findUnique(args: { where: { id: string } }): Promise<Entity | null>;
  update(args: {
    where: { id: string };
    data: Partial<Omit<Entity, "id">>;
  }): Promise<Entity>;
  delete(args: { where: { id: string } }): Promise<Entity>;
};

abstract class BaseModel<Entity extends IEntityBasic> {
  constructor(protected readonly delegate: IPrismaDelegate<Entity>) {}

  async create(
    id: string,
    data: Omit<Entity, "id" | "createdAt" | "updatedAt">
  ): Promise<Entity> {
    return this.delegate.create({ data: { id, ...data } });
  }

  async read(id: string): Promise<Entity | null> {
    return this.delegate.findUnique({ where: { id } });
  }

  async update(
    id: string,
    data: Partial<Omit<Entity, "id">>
  ): Promise<Entity> {
    return this.delegate.update({ where: { id }, data });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.delegate.delete({ where: { id } });

      return true;
    } catch {
      return false;
    }
  }
}

export { BaseModel };
export type { IEntityBasic, IPrismaDelegate };
