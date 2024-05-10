# Hono Sessions Middleware
Use cookie-based sessions with the [Hono](https://hono.dev/) framework.

### Supported runtimes

Hono Sessions is currently tested on these runtimes:

- Deno
- Cloudflare Workers
- Cloudflare Pages
- Bun
- Node (v20+)

Other runtimes may work, but are untested. In addition to Hono's requirements, the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) is required for this library.

If you want to use a backend storage driver (instead of just storing session data in an encrypted cookie), you'll need to use a storage engine provided by Hono Sessions. Right now, those include:

- Deno KV
- Bun SQLite

### 🛠️ Features
- Flash messages — data that is deleted once it's read (one-off error messages, etc.)
- Built-in Memory and Cookie storage drivers (more coming soon)
- Encrypted cookies thanks to [iron-webcrypto](https://github.com/brc-dd/iron-webcrypto)
- Session expiration after inactivity
- Session key rotation* 

> *It is not necessary to rotate CookieStore sessions because of how a pure cookie session works (no server-side state). Therefore, using session key rotation will have no effect while using CookieStore.

## Installation and Usage

### Deno

Simply include the package from `deno.land/x`

```ts
import { sessionMiddleware } from 'https://deno.land/x/hono_sessions/mod.ts'
```

### Node, Bun, Cloudflare Workers, etc.

Install the NPM package
```
npm install hono-sessions
```

## Examples

### Deno
```ts
import { Hono } from 'https://deno.land/x/hono/mod.ts'
import { 
  Session,
  sessionMiddleware, 
  CookieStore 
} from 'https://deno.land/x/hono_sessions/mod.ts'

const app = new Hono<{
  Variables: {
    session: Session,
    session_key_rotation: boolean
  }
}>()

const store = new CookieStore()

app.use('*', sessionMiddleware({
  store,
  encryptionKey: 'password_at_least_32_characters_long', // Required for CookieStore, recommended for others
  expireAfterSeconds: 900, // Expire session after 15 minutes of inactivity
  cookieOptions: {
    sameSite: 'Lax', // Recommended for basic CSRF protection in modern browsers
    path: '/', // Required for this library to work properly
    httpOnly: true, // Recommended to avoid XSS attacks
  },
}))

app.get('/', async (c, next) => {
  const session = c.get('session')

  if (session.get('counter')) {
    session.set('counter', session.get('counter') as number + 1)
  } else {
    session.set('counter', 1)
  }

  return c.html(`<h1>You have visited this page ${ session.get('counter') } times</h1>`)
})

Deno.serve(app.fetch)
```

#### Using Deno KV storage driver

```ts
import { Hono } from 'https://deno.land/x/hono/mod.ts'
import { sessionMiddleware } from 'https://deno.land/x/hono_sessions/mod.ts'
import { DenoKvStore } from 'https://deno.land/x/hono_sessions/src/store/deno/DenoKvStore.ts'

const app = new Hono()

const kv = await Deno.openKv()
const store = new DenoKvStore(kv)

app.use('*', sessionMiddleware({
  store,
  // ... other session options
}))

// Other app code

Deno.serve(app.fetch)

```

### Bun

```ts
import { Hono } from 'hono'
import { sessionMiddleware, CookieStore, Session } from 'hono-sessions'

// Same as Deno, however instead of:
// Deno.serve(app.fetch)
// use:

export default {
  port: 3000,
  fetch: app.fetch
}
```

#### Using Bun's SQLite storage driver

This will automatically create a `database.sqlite` file and a `sessions` table in that sqlite database.

```ts
import { Hono } from 'hono'
import { sessionMiddleware } from 'hono-sessions'
import { BunSqliteStore } from 'hono-sessions/bun-sqlite-store'
import { Database } from 'bun:sqlite'

const app = new Hono()

const db = new Database('./database.sqlite')
const store = new BunSqliteStore(db)

app.use('*', sessionMiddleware({
  store,
  // ... other session options
}))

// Other app code

export default {
  port: 3000,
  fetch: app.fetch
}
```

### Cloudflare Workers / Pages

```ts
import { Hono } from 'hono'
import { sessionMiddleware, CookieStore, Session } from 'hono-sessions'

// Same as Deno, however instead of:
// Deno.serve(app.fetch)
// use:

export default app
```

## Troubleshooting

### TypeScript errors

Hono has a high upgrade frequency, but the API for middleware this library relies on remains largely unchanged between Hono releases. You may experience a TypeScript error if you use this library with the latest version of Hono. In that case, before you load the middleware into your Hono app, you might want to have TypeScript ignore this error:

```ts
// @ts-ignore
app.use('*', sessionMiddleware({
  // ...
}))
```

TypeScript should otherwise work normally.

## Contributing

This package is built Deno-first, so you'll need to have Deno installed in your development environment. See their [website](https://deno.com/) for installation instructions specific to your platform.

Once Deno is installed, there is a test server you can run a basic web server to check your changes:

```
deno run --allow-net --watch test/deno/server_deno.ts
```

There's also a [Playwright](https://playwright.dev/) test suite. By default, it is set up to run a Deno server with the MemoryStore driver. In Github actions, it runs through a series of runtimes and storage drivers when a pull request is made.

```
cd playwright
npm install
npx playwright test
```
