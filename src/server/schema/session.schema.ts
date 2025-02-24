import { z } from "zod";

const refreshSessionSchema = z.object({
    refreshToken: z.string()
});

type RefreshSessionInput = z.TypeOf<typeof refreshSessionSchema>

export {
    refreshSessionSchema
}

export type {
    RefreshSessionInput
}