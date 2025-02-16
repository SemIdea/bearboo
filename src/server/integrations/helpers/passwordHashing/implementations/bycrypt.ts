import { hash, compare } from "bcrypt";

import { IPasswordHashingHelperAdapter } from "../adapter";

class BycryptPasswordHashingHelper implements IPasswordHashingHelperAdapter {
  async hash(password: string): Promise<string> {
    return await hash(password, 10);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return await compare(password, hashedPassword);
  }
}

export { BycryptPasswordHashingHelper };
