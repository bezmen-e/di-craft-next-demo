import { createToken } from "di-craft";
import type { Hydratable } from "di-craft/next/client";

export type UserSnapshot = {
	readonly users: readonly User[];
	readonly loadedAt: string | null;
};

export type UserStateContract = Hydratable<UserSnapshot> & {
	setUsers(users: readonly User[]): void;
};

export type User = {
	readonly id: number;
	readonly name: string;
	readonly email: string;
	readonly company: string;
};

export type RequestResource = {
	readonly createdAt: string;
	readonly requestId: string;
};

export const REQUEST_ID = createToken<string>("REQUEST_ID");
export const REQUEST_RESOURCE =
	createToken<RequestResource>("REQUEST_RESOURCE");
export const USER_STATE = createToken<UserStateContract>("USER_STATE");
export const USERS_SERVICE = createToken<{
	list(): Promise<readonly User[]>;
}>("USERS_SERVICE");
