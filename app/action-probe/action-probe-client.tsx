"use client";

import { useActionState } from "react";
import {
	type ActionProbeState,
	loadUsersAction,
} from "./actions";

const initialActionProbeState: ActionProbeState = {
	count: null,
	requestId: null,
	status: "idle",
};

export function ActionProbeClient() {
	const [state, formAction, isPending] = useActionState(
		loadUsersAction,
		initialActionProbeState,
	);

	return (
		<form action={formAction}>
			<button data-testid="server-action-button" disabled={isPending} type="submit">
				{isPending ? "Loading..." : "Run server action"}
			</button>
			<pre data-testid="server-action-state">
				{JSON.stringify(state, null, 2)}
			</pre>
		</form>
	);
}
