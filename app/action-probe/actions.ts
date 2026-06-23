"use server";

import { runWithRequestContainer } from "../di.server";
import { REQUEST_ID, REQUEST_RESOURCE, USERS_SERVICE } from "../tokens";

export type ActionProbeState = {
	readonly count: number | null;
	readonly requestId: string | null;
	readonly status: "idle" | "loaded";
};

export async function loadUsersAction(
	_state: ActionProbeState,
): Promise<ActionProbeState> {
	return runWithRequestContainer({
		run: async (container) => {
			const resource = container.get(REQUEST_RESOURCE);
			const users = await container.get(USERS_SERVICE).list();
			const requestId = container.get(REQUEST_ID);

			console.log("[di-craft next/server-action] action completed", {
				count: users.length,
				resourceCreatedAt: resource.createdAt,
				requestId,
			});

			return {
				count: users.length,
				requestId,
				status: "loaded",
			};
		},
	});
}
