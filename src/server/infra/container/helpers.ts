import { IPasswordHashingHelperAdapter } from "@/lib/passwordHashing/adapter";
import { BycryptPasswordHashingHelper } from "@/lib/passwordHashing/implementations/bycrypt";
import { IRateLimitHelperAdapter } from "@/lib/rateLimit/adapter";
import { InMemoryRateLimit } from "@/lib/rateLimit/implementations/inMemory";
import { ISlugGeneratorHelperAdapter } from "@/lib/slug/adapter";
import { KebabCaseSlugGenerator } from "@/lib/slug/implementations/kebabCase";
import { IUidGeneratorHelperAdapter } from "@/lib/uidGenerator/adapter";
import { UuidGenerator } from "@/lib/uidGenerator/implementations/uuid";

type IHelpers = {
	hashing: IPasswordHashingHelperAdapter;
	uid: IUidGeneratorHelperAdapter;
	slug: ISlugGeneratorHelperAdapter;
	rateLimit: IRateLimitHelperAdapter;
};

const helpers: IHelpers = {
	hashing: new BycryptPasswordHashingHelper(),
	uid: new UuidGenerator(),
	slug: new KebabCaseSlugGenerator(),
	rateLimit: new InMemoryRateLimit(),
};

export type { IHelpers };
export { helpers };
