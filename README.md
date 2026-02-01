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
- Built-in Memory and Cookie storage drivers, as well as [community-supported drivers](https://github.com/jcs224/hono_sessions/wiki/Community-adapters) and the ability to [create your own storage driver](https://github.com/jcs224/hono_sessions/wiki/Creating-a-custom-storage-driver)
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
  encryptionKey: 'password_at_least_32_characters_long', // Required for CookieStore, recommended for others.
  // You can also supply a function instead of a plain string
  // encryptionKey: () => 'function_that_returns_a_long_string'
  expireAfterSeconds: 900, // Expire session after 15 minutes of inactivity
  autoExtendExpiration: true, // Extend the session expiration time automatically. Defaults to true
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

app.get('/read', (c) => {
  const session = c.get('session')
  session.touch() // Update the session expiration time
  return c.json({
    counter: session.get('counter')
  })
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

## API

The `session` object returned from `c.get('session')` has several methods:

- `get(id: string)`: Fetch the value from a given key.

- `set(id: string, value: any)`: Set a value that can be serialized with `JSON.stringify()`

- `flash(id: string, value: any)`: Similar to `set()`, however the value is deleted immediately after it's read once. Best used for one-off alerts or form validation messages (login failure, etc.)

- `forget(id: string)`: Remove a value from the session based on its key

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
