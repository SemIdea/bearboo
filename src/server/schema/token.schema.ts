import { z } from "zod";

const verifyTokenSchema = z.object({
  token: z.string()
});

type VerifyTokenInput = z.TypeOf<typeof verifyTokenSchema>;

export { verifyTokenSchema };

export type { VerifyTokenInput };
