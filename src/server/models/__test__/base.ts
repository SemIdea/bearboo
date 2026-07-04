import { describe, expect, test } from "vitest";
import { InMemoryDelegate } from "@/test/repositories/inMemoryDelegate";
import { BaseModel, IEntityBasic } from "../base";

type TestEntity = IEntityBasic & {
	name: string;
	createdAt: Date;
	updatedAt: Date;
};

class TestModel extends BaseModel<TestEntity> {
	constructor() {
		super(new InMemoryDelegate<TestEntity>());
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
