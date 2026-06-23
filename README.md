# di-craft Next App Router Demo

Minimal Next.js App Router demo for [di-craft](https://github.com/bezmen-e/di-craft).

This repo shows how the `di-craft/next` adapter can be used with React Server Components while keeping the core DI package framework-agnostic.

The adapter does not move a DI container from the server to the client. Instead, it uses request-scoped containers on the server and passes only serializable state snapshots to the client.

## Core Idea

```txt
server root container
  -> request child container
      -> scoped services/state for one request
          -> serializable snapshot
              -> client-safe state
```

In short:

```txt
server DI -> snapshot -> client state
```

Not:

```txt
server DI -> client DI
```

This keeps server-only dependencies on the server and avoids coupling the core DI container to React or Next.js.

## What This Demo Covers

- App Router page with a request-scoped DI container;
- nested Server Components sharing the same request container;
- Route Handler usage;
- Server Action usage;
- parallel requests creating separate request containers;
- server state dehydration into a serializable snapshot;
- client-side hydration into a separate client-safe state.

## How It Works

The server setup creates one root container and a request child container for each render/request.

```ts
import "server-only";
import { cache } from "react";
import { createNextDi } from "di-craft/next/server";

export const { getRequestContainer, runWithRequestContainer } = createNextDi({
  cache,
  providers,
  requestProviders: () => [
    provideValue(REQUEST_ID, crypto.randomUUID()),
  ],
});
```

Inside Server Components, `getRequestContainer()` returns the request-scoped container.

```ts
const container = getRequestContainer();
const users = await container.get(USERS_SERVICE).list();
```

For client boundaries, the server creates a serializable snapshot.

```ts
const snapshot = dehydrate({
  container,
  schema: hydration,
});
```

The client receives that snapshot and hydrates client-safe state.

```ts
hydrate({
  container,
  schema: hydration,
  snapshot,
});
```

## Routes

```txt
/
```

Shows the basic Page/RSC flow:

- creates a request container;
- loads users on the server;
- stores users in server state;
- dehydrates server state;
- passes the snapshot to a Client Component;
- hydrates client-safe state.

```txt
/nested
```

Shows that nested Server Components can resolve from the same request container during one render.

```txt
/action-probe
```

Shows Server Action usage with an explicit request container lifecycle.

```txt
/api/di
```

Shows Route Handler usage with an explicit request container lifecycle.

## Run Locally

```sh
npm install
npm run dev
```

Then open:

```txt
http://localhost:3000
```

## What To Check

Check the terminal logs for server-side behavior:

```txt
[di-craft next/server] create request providers
[di-craft next/server] create scoped UserState
[di-craft next/server] create scoped UsersService
[di-craft next/server] dehydrate UserState
```

Check the browser console for client-side hydration:

```txt
[di-craft next/client] create client-safe container
[di-craft next/client] hydrate ClientUserState
```

For Route Handlers and Server Actions, check that scoped resources are disposed after the request/action finishes.

## StackBlitz Note

This demo is designed for a real local Node.js environment or Vercel deployment.

StackBlitz/WebContainer environments may fail with current Next.js dev runtime limitations, especially around Turbopack, Webpack fallback, and RSC internals. If that happens, run the demo locally instead.

## Links

- npm package: https://www.npmjs.com/package/di-craft
- library source: https://github.com/bezmen-e/di-craft
- Next.js adapter docs: https://github.com/bezmen-e/di-craft#nextjs-app-router
