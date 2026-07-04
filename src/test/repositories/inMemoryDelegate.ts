import { IEntityBasic, IPrismaDelegate } from "@/server/models/base";

class InMemoryDelegate<Entity extends IEntityBasic>
	implements IPrismaDelegate<Entity>
{
	private readonly store = new Map<string, Entity>();

	async create(args: {
		data: { id: string } & Omit<Entity, "id" | "createdAt" | "updatedAt">;
	}): Promise<Entity> {
		const entity = {
			...args.data,
			createdAt: new Date(),
			updatedAt: new Date(),
		} as object as Entity;

		this.store.set(entity.id, entity);

		return entity;
	}

	async findUnique(args: { where: { id: string } }): Promise<Entity | null> {
		return this.store.get(args.where.id) ?? null;
	}

	async update(args: {
		where: { id: string };
		data: Partial<Omit<Entity, "id">>;
	}): Promise<Entity> {
		const existing = this.store.get(args.where.id);

		if (!existing) {
			throw new Error(`Record with id "${args.where.id}" not found`);
		}

		const updated = {
			...existing,
			...args.data,
			updatedAt: new Date(),
		} as object as Entity;

		this.store.set(updated.id, updated);

		return updated;
	}

	async delete(args: { where: { id: string } }): Promise<Entity> {
		const existing = this.store.get(args.where.id);

		if (!existing) {
			throw new Error(`Record with id "${args.where.id}" not found`);
		}

		this.store.delete(args.where.id);

		return existing;
	}

	async findMany(predicate?: (entity: Entity) => boolean): Promise<Entity[]> {
		const all = Array.from(this.store.values());

		return predicate ? all.filter(predicate) : all;
	}
}

export { InMemoryDelegate };
