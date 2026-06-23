import { dehydrate } from "di-craft/next/server";
import { getRequestContainer } from "./di.server";
import { hydration } from "./hydration";
import { REQUEST_ID, USERS_SERVICE } from "./tokens";
import { UsersClient } from "./users-client";

export default async function Page() {
	const container = getRequestContainer();
	const sameRequestContainer = getRequestContainer();
	const isSameRequestContainer = container === sameRequestContainer;

	console.log("[di-craft next/server] render Page", {
		isSameRequestContainer,
	});

	const users = await container.get(USERS_SERVICE).list();
	const requestId = container.get(REQUEST_ID);
	const snapshot = dehydrate({
		container,
		schema: hydration,
	});

	console.log("[di-craft next/server] pass snapshot to Client Component", {
		count: snapshot.user.users.length,
		loadedAt: snapshot.user.loadedAt,
		requestId,
	});

	return (
		<main>
			<h1>di-craft Next adapter</h1>
			<p>Request id: {requestId}</p>
			<ul>
				{users.map((user) => (
					<li key={user.id}>
						<strong>{user.name}</strong> — {user.email} / {user.company}
					</li>
				))}
			</ul>
			<UsersClient snapshot={snapshot} />
		</main>
	);
}
