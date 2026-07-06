import { describe, expect, test } from "vitest";
import { BaseModel, IEntityBasic, IPrismaDelegate } from "../base";

type TestEntity = IEntityBasic & {
	name: string;
	createdAt: Date;
	updatedAt: Date;
};

class StubDelegate implements IPrismaDelegate<TestEntity> {
	private readonly store = new Map<string, TestEntity>();

	async create(args: {
		data: { id: string } & Omit<TestEntity, "id" | "createdAt" | "updatedAt">;
	}): Promise<TestEntity> {
		const entity = {
			...args.data,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		this.store.set(entity.id, entity);

		return entity;
	}

	async findUnique(args: {
		where: { id: string };
	}): Promise<TestEntity | null> {
		return this.store.get(args.where.id) ?? null;
	}

	async update(args: {
		where: { id: string };
		data: Partial<Omit<TestEntity, "id">>;
	}): Promise<TestEntity> {
		const existing = this.store.get(args.where.id);

		if (!existing) {
			throw new Error(`Record with id "${args.where.id}" not found`);
		}

		const updated = { ...existing, ...args.data, updatedAt: new Date() };

		this.store.set(updated.id, updated);

		return updated;
	}

	async delete(args: { where: { id: string } }): Promise<TestEntity> {
		const existing = this.store.get(args.where.id);

		if (!existing) {
			throw new Error(`Record with id "${args.where.id}" not found`);
		}

		this.store.delete(args.where.id);

		return existing;
	}
}

class TestModel extends BaseModel<TestEntity> {
	constructor() {
		super(new StubDelegate());
	}
}

describe("BaseModel", () => {
	test("creates, reads and updates entities through the delegate", async () => {
		const model = new TestModel();

		const created = await model.create("entity-1", { name: "Initial" });
		const read = await model.read("entity-1");
		const updated = await model.update("entity-1", { name: "Updated" });

		expect(created).toMatchObject({ id: "entity-1", name: "Initial" });
		expect(created.createdAt).toBeInstanceOf(Date);
		expect(read).toEqual(created);
		expect(updated).toMatchObject({ id: "entity-1", name: "Updated" });
		expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
			created.updatedAt.getTime(),
		);
	});

	test("returns true when delete succeeds and false when delegate throws", async () => {
		const model = new TestModel();

		await model.create("entity-1", { name: "Deletable" });

		await expect(model.delete("entity-1")).resolves.toBe(true);
		await expect(model.read("entity-1")).resolves.toBeNull();
		await expect(model.delete("missing-entity")).resolves.toBe(false);
	});
});
