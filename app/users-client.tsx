"use client";

import { createContainer, provideValue } from "di-craft";
import { type HydrationSnapshot, hydrate } from "di-craft/next/client";
import { useMemo } from "react";
import { hydration } from "./hydration";
import {
	USER_STATE,
	type User,
	type UserSnapshot,
	type UserStateContract,
} from "./tokens";

type UsersClientProps = {
	readonly snapshot: HydrationSnapshot<typeof hydration>;
};

class ClientUserState implements UserStateContract {
	private users: readonly User[] = [];
	private loadedAt: string | null = null;

	setUsers(users: readonly User[]): void {
		console.log("[di-craft next/client] set users in ClientUserState", {
			count: users.length,
		});

		this.users = users;
	}

	dehydrate(): UserSnapshot {
		return {
			loadedAt: this.loadedAt,
			users: this.users,
		};
	}

	hydrate(snapshot: UserSnapshot): void {
		console.log("[di-craft next/client] hydrate ClientUserState", {
			count: snapshot.users.length,
			loadedAt: snapshot.loadedAt,
		});

		this.loadedAt = snapshot.loadedAt;
		this.users = snapshot.users;
	}
}

export function UsersClient({ snapshot }: UsersClientProps) {
	const userState = useMemo(() => {
		console.log("[di-craft next/client] create client-safe container");

		const state = new ClientUserState();
		const clientContainer = createContainer([provideValue(USER_STATE, state)]);

		hydrate({
			container: clientContainer,
			schema: hydration,
			snapshot,
		});

		return state;
	}, [snapshot]);

	const hydratedSnapshot = userState.dehydrate();

	return (
		<p data-testid="hydrated-users">
			Hydrated users: {hydratedSnapshot.users.length}
			{hydratedSnapshot.loadedAt
				? ` / loaded at ${hydratedSnapshot.loadedAt}`
				: ""}
		</p>
	);
}
