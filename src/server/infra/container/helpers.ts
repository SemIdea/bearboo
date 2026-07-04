import { IPasswordHashingHelperAdapter } from "@/lib/passwordHashing/adapter";
import { IUidGeneratorHelperAdapter } from "@/lib/uidGenerator/adapter";

import { BycryptPasswordHashingHelper } from "@/lib/passwordHashing/implementations/bycrypt";
import { UuidGenerator } from "@/lib/uidGenerator/implementations/uuid";

type IHelpers = {
  hashing: IPasswordHashingHelperAdapter;
  uid: IUidGeneratorHelperAdapter;
};

const helpers: IHelpers = {
  hashing: new BycryptPasswordHashingHelper(),
  uid: new UuidGenerator()
};

export { helpers };

export type { IHelpers };
