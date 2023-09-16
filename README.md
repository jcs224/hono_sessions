# Hono Sessions Middleware
Use cookie-based sessions with the [Hono](https://hono.dev/) framework. Currently tested to work with Deno, Cloudflare Workers, and Bun.

### 🛠️ Features
- Runs in Deno, Cloudflare Workers, and Bun (possibly others, currently untested)
- Flash messages — data that is deleted once it's read (one-off error messages, etc.)
- Built-in Memory and Cookie storage drivers (more coming soon)
- Encrypted cookies thanks to [iron-webcrypto](https://github.com/brc-dd/iron-webcrypto)
- Session expiration after inactivity
- Session key rotation* 

> *CookieStore is not able to rotate session keys by nature of how a pure cookie session works (no server-side state).

## Installation and Usage

### Deno

Simply include the package from `deno.land/x`

```ts
import { sessionMiddleware } from 'https://deno.land/x/hono_sessions/mod.ts'
```

### Bun, Cloudflare Workers

Install the NPM package
```
npm install hono-sessions
```

## Examples

### Deno
```ts
import { Hono } from 'https://deno.land/x/hono@v3.5.8/mod.ts'
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
  expireAfterSeconds: 900, // Expire session after 15 minutes
  cookieOptions: {
    sameSite: 'Lax',
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

### Cloudflare Workers

```ts
import { Hono } from 'hono'
import { sessionMiddleware, CookieStore, Session } from 'hono-sessions'

// Same as Deno, however instead of:
// Deno.serve(app.fetch)
// use:

export default app
```

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