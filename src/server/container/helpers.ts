import { IPasswordHashingHelperAdapter } from "@/server/integrations/helpers/passwordHashing/adapter";
import { IUidGeneratorHelperAdapter } from "@/server/integrations/helpers/uidGenerator/adapter";

import { BycryptPasswordHashingHelper } from "@/server/integrations/helpers/passwordHashing/implementations/bycrypt";
import { UuidGenerator } from "@/server/integrations/helpers/uidGenerator/implementations/uuid";

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
