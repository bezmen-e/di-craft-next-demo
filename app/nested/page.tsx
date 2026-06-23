import { getRequestContainer } from "../di.server";
import { REQUEST_ID } from "../tokens";

export const dynamic = "force-dynamic";

type NestedProbeProps = {
	readonly rootRequestId: string;
};

async function NestedProbe({ rootRequestId }: NestedProbeProps) {
	const container = getRequestContainer();
	const nestedRequestId = container.get(REQUEST_ID);
	const isSameRequest = rootRequestId === nestedRequestId;

	console.log("[di-craft next/nested-rsc] nested component", {
		isSameRequest,
		nestedRequestId,
		rootRequestId,
	});

	return (
		<section>
			<h2>Nested RSC</h2>
			<p data-testid="nested-request-id">Nested request id: {nestedRequestId}</p>
			<p data-testid="nested-same-request">
				Same request container: {String(isSameRequest)}
			</p>
		</section>
	);
}

export default async function NestedPage() {
	const container = getRequestContainer();
	const secondContainer = getRequestContainer();
	const rootRequestId = container.get(REQUEST_ID);
	const isSameContainer = container === secondContainer;

	console.log("[di-craft next/nested-rsc] root page", {
		isSameContainer,
		rootRequestId,
	});

	return (
		<main>
			<h1>Nested RSC probe</h1>
			<p data-testid="root-request-id">Root request id: {rootRequestId}</p>
			<p data-testid="root-same-container">
				Same root container call: {String(isSameContainer)}
			</p>
			<NestedProbe rootRequestId={rootRequestId} />
		</main>
	);
}
