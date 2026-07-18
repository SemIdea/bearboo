import { IPasswordHashingHelperAdapter } from "@/lib/passwordHashing/adapter";
import { BycryptPasswordHashingHelper } from "@/lib/passwordHashing/implementations/bycrypt";
import { IPermissionHelperAdapter } from "@/lib/permissions/adapter";
import { MatrixPermission } from "@/lib/permissions/implementations/matrix";
import { IRateLimitHelperAdapter } from "@/lib/rateLimit/adapter";
import { InMemoryRateLimit } from "@/lib/rateLimit/implementations/inMemory";
import { IReferrerClassifierHelperAdapter } from "@/lib/referrerClassifier/adapter";
import { RegexReferrerClassifier } from "@/lib/referrerClassifier/implementations/regex";
import { ISlugGeneratorHelperAdapter } from "@/lib/slug/adapter";
import { KebabCaseSlugGenerator } from "@/lib/slug/implementations/kebabCase";
import { IUidGeneratorHelperAdapter } from "@/lib/uidGenerator/adapter";
import { UuidGenerator } from "@/lib/uidGenerator/implementations/uuid";
import { IUserAgentClassifierHelperAdapter } from "@/lib/userAgentClassifier/adapter";
import { RegexUserAgentClassifier } from "@/lib/userAgentClassifier/implementations/regex";

type IHelpers = {
	hashing: IPasswordHashingHelperAdapter;
	uid: IUidGeneratorHelperAdapter;
	slug: ISlugGeneratorHelperAdapter;
	rateLimit: IRateLimitHelperAdapter;
	permissions: IPermissionHelperAdapter;
	referrerClassifier: IReferrerClassifierHelperAdapter;
	userAgentClassifier: IUserAgentClassifierHelperAdapter;
};

const helpers: IHelpers = {
	hashing: new BycryptPasswordHashingHelper(),
	uid: new UuidGenerator(),
	slug: new KebabCaseSlugGenerator(),
	rateLimit: new InMemoryRateLimit(),
	permissions: new MatrixPermission(),
	referrerClassifier: new RegexReferrerClassifier(),
	userAgentClassifier: new RegexUserAgentClassifier(),
};

export type { IHelpers };
export { helpers };
