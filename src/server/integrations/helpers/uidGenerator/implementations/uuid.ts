import { v4 as uuidv4 } from "uuid";
import { IUidGeneratorHelperAdapter } from "../adapter";

class UuidGenerator implements IUidGeneratorHelperAdapter {
  generate() {
    return uuidv4();
  }
}

export { UuidGenerator };
