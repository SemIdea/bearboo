import { createFakeGateways } from "@/test/gateways";
import { TestContext } from "./testContext";

function createTestContext(): TestContext {
	return new TestContext({
		gateways: createFakeGateways(),
	});
}

export { createTestContext };
