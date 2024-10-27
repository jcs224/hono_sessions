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

### 🛠️ Features
- Flash messages — data that is deleted once it's read (one-off error messages, etc.)
- Built-in Memory and Cookie storage drivers, as well as [community-supported drivers](https://github.com/jcs224/hono_sessions/wiki)
- Encrypted cookies thanks to [iron-webcrypto](https://github.com/brc-dd/iron-webcrypto)
- Session expiration after inactivity
- Session key rotation* 
- Strong typing for session variables

> *It is not necessary to rotate CookieStore sessions because of how a pure cookie session works (no server-side state). Therefore, using session key rotation will have no effect while using CookieStore.

## Installation and Usage

### Deno

Simply include the package from [JSR](https://jsr.io/@jcs224/hono-sessions) or [NPM](https://www.npmjs.com/package/hono-sessions)

```ts
// JSR
import { sessionMiddleware } from 'jsr:@jcs224/hono-sessions'

// NPM
import { sessionMiddleware } from 'npm:hono-sessions'
```

You can also use `deno add` and not need the `jsr:` specifier. 

### Node, Bun, Cloudflare Workers, etc.

Install the NPM package
```
npm install hono-sessions
```

## Examples

### Deno
```ts
import { Hono } from 'npm:hono'
import { 
  Session,
  sessionMiddleware, 
  CookieStore 
} from 'jsr:@jcs224/hono-sessions'

// Add types to your session data (optional)
type SessionDataTypes = {
  'counter': number
}

// Set up your Hono instance, using your types
const app = new Hono<{
  Variables: {
    session: Session<SessionDataTypes>,
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

  session.set('counter', (session.get('counter') || 0) + 1)

  return c.html(`<h1>You have visited this page ${ session.get('counter') } times</h1>`)
})

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
