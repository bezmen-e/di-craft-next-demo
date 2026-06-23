import { runWithRequestContainer } from "../../di.server";
import { REQUEST_ID, REQUEST_RESOURCE, USERS_SERVICE } from "../../tokens";

export async function GET() {
	return runWithRequestContainer({
		run: async (container) => {
			const resource = container.get(REQUEST_RESOURCE);
			const users = await container.get(USERS_SERVICE).list();
			const requestId = container.get(REQUEST_ID);

			console.log("[di-craft next/route-handler] handled request", {
				count: users.length,
				resourceCreatedAt: resource.createdAt,
				requestId,
			});

			return Response.json({
				count: users.length,
				resourceCreatedAt: resource.createdAt,
				requestId,
				source: "route-handler",
			});
		},
	});
}
