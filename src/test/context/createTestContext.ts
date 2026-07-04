import { createFakeGateways } from "@/test/gateways";
import { createInMemoryRepositories } from "@/test/repositories";
import { TestContext } from "./testContext";

function createTestContext(): TestContext {
	return new TestContext({
		repositories: createInMemoryRepositories(),
		gateways: createFakeGateways(),
	});
}

export { createTestContext };
