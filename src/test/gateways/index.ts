import { IGateways } from "@/server/infra/container/gateways";
import { FakeMailerGateway } from "./mail";

function createFakeGateways(): IGateways {
	return { mail: new FakeMailerGateway() };
}

export { createFakeGateways };
