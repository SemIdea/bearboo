import { IPasswordHashingHelperAdapter } from "@/lib/passwordHashing/adapter";
import { BycryptPasswordHashingHelper } from "@/lib/passwordHashing/implementations/bycrypt";
import { ISlugGeneratorHelperAdapter } from "@/lib/slug/adapter";
import { KebabCaseSlugGenerator } from "@/lib/slug/implementations/kebabCase";
import { IUidGeneratorHelperAdapter } from "@/lib/uidGenerator/adapter";
import { UuidGenerator } from "@/lib/uidGenerator/implementations/uuid";

type IHelpers = {
	hashing: IPasswordHashingHelperAdapter;
	uid: IUidGeneratorHelperAdapter;
	slug: ISlugGeneratorHelperAdapter;
};

const helpers: IHelpers = {
	hashing: new BycryptPasswordHashingHelper(),
	uid: new UuidGenerator(),
	slug: new KebabCaseSlugGenerator(),
};

export type { IHelpers };
export { helpers };
