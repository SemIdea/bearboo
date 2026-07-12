import { IPasswordHashingHelperAdapter } from "@/lib/passwordHashing/adapter";
import { BycryptPasswordHashingHelper } from "@/lib/passwordHashing/implementations/bycrypt";
import { IPermissionHelperAdapter } from "@/lib/permissions/adapter";
import { MatrixPermission } from "@/lib/permissions/implementations/matrix";
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
	permissions: IPermissionHelperAdapter;
};

const helpers: IHelpers = {
	hashing: new BycryptPasswordHashingHelper(),
	uid: new UuidGenerator(),
	slug: new KebabCaseSlugGenerator(),
	rateLimit: new InMemoryRateLimit(),
	permissions: new MatrixPermission(),
};

export type { IHelpers };
export { helpers };
