import "server-only";
import { type Provider, provideFactory, provideValue, Scopes } from "di-craft";
import { createNextDi, type Hydratable } from "di-craft/next/server";
import { cache } from "react";
import {
	REQUEST_ID,
	REQUEST_RESOURCE,
	type RequestResource,
	USER_STATE,
	USERS_SERVICE,
	type User,
	type UserSnapshot,
	type UserStateContract,
} from "./tokens";

class UserState implements Hydratable<UserSnapshot> {
	private users: readonly User[] = [];
	private loadedAt: string | null = null;

	constructor() {
		console.log("[di-craft next/server] create scoped UserState");
	}

	setUsers(users: readonly User[]): void {
		console.log("[di-craft next/server] save API users into UserState", {
			count: users.length,
		});

		this.users = users;
		this.loadedAt = new Date().toISOString();
	}

	dehydrate(): UserSnapshot {
		console.log("[di-craft next/server] dehydrate UserState", {
			count: this.users.length,
			loadedAt: this.loadedAt,
		});

		return {
			loadedAt: this.loadedAt,
			users: this.users,
		};
	}

	hydrate(snapshot: UserSnapshot): void {
		console.log("[di-craft next/server] hydrate UserState", {
			count: snapshot.users.length,
			loadedAt: snapshot.loadedAt,
		});

		this.users = snapshot.users;
		this.loadedAt = snapshot.loadedAt;
	}
}

type JsonPlaceholderUser = {
	readonly id: number;
	readonly name: string;
	readonly email: string;
	readonly company: {
		readonly name: string;
	};
};

class UsersService {
	constructor(
		private readonly state: UserStateContract,
		private readonly requestId: string,
	) {
		console.log("[di-craft next/server] create scoped UsersService", {
			requestId,
		});
	}

	async list(): Promise<readonly User[]> {
		console.log("[di-craft next/server] fetch users from external API", {
			requestId: this.requestId,
		});

		const response = await fetch("https://jsonplaceholder.typicode.com/users", {
			cache: "no-store",
		});

		if (!response.ok) {
			throw new Error(`Users API failed with status ${response.status}.`);
		}

		const apiUsers = (await response.json()) as readonly JsonPlaceholderUser[];
		const users = apiUsers.map((user) => ({
			company: user.company.name,
			email: user.email,
			id: user.id,
			name: user.name,
		}));

		console.log("[di-craft next/server] external API users loaded", {
			count: users.length,
			requestId: this.requestId,
		});

		this.state.setUsers(users);

		return users;
	}
}

const providers: readonly Provider[] = [
	provideFactory(REQUEST_RESOURCE, {
		scope: Scopes.Scoped,
		deps: {
			requestId: REQUEST_ID,
		},
		useFactory: ({ requestId }) => {
			const resource: RequestResource = {
				createdAt: new Date().toISOString(),
				requestId,
			};

			console.log("[di-craft next/server] create scoped request resource", {
				createdAt: resource.createdAt,
				requestId,
			});

			return resource;
		},
		onDispose: (resource) => {
			console.log("[di-craft next/server] dispose scoped request resource", {
				createdAt: resource.createdAt,
				requestId: resource.requestId,
			});
		},
	}),
	provideFactory(USER_STATE, {
		scope: Scopes.Scoped,
		useFactory: () => new UserState(),
	}),
	provideFactory(USERS_SERVICE, {
		scope: Scopes.Scoped,
		deps: {
			requestId: REQUEST_ID,
			state: USER_STATE,
		},
		useFactory: ({ requestId, state }) => new UsersService(state, requestId),
	}),
];

export const { getRequestContainer, runWithRequestContainer } = createNextDi({
	cache,
	providers,
	requestProviders: () => {
		const requestId = crypto.randomUUID();

		console.log("[di-craft next/server] create request providers", {
			requestId,
		});

		return [provideValue(REQUEST_ID, requestId)];
	},
});
