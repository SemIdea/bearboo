import { IGateways } from "@/server/infra/container/gateways";
import { FakeMailerGateway } from "./mail";
import { FakeMediaStorageGateway } from "./mediaStorage";
import { FakeViewCounterGateway } from "./viewCounter";

function createFakeGateways(): IGateways {
	return {
		mail: new FakeMailerGateway(),
		viewCounter: new FakeViewCounterGateway(),
		mediaStorage: new FakeMediaStorageGateway(),
	};
}

export { createFakeGateways };
