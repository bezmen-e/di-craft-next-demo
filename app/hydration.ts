import type { HydrationSchema } from "di-craft/next/client";
import { USER_STATE } from "./tokens";

export const hydration = {
	user: USER_STATE,
} satisfies HydrationSchema;
