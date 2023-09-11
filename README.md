# Hono Sessions Middleware
Use cookie-based sessions with the [Hono](https://hono.dev/) framework. Currently tested to work with Deno, Cloudflare Workers, and Bun.

### 🛠️ Features
- Runs in Deno, Cloudflare Workers, and Bun (possibly others, currently untested)
- Flash messages — data that is deleted once it's read (one-off error messages, etc.)
- Built-in Memory and Cookie storage drivers (more coming soon)
- Encrypted cookies thanks to [iron-webcrypto](https://github.com/brc-dd/iron-webcrypto)
- Session expiration after inactivity
- Session key rotation, for mitigating session fixation attacks

## Usage

### Cloudflare Workers

Install from NPM
```
npm install hono-sessions
```

Here is a full-fledged example that shows what a login form might look like:

```ts
import { Hono } from 'hono'
import { sessionMiddleware, CookieStore, Session } from 'hono-sessions'

const store = new CookieStore()

const app = new Hono()

const sessionRoutes = new Hono<{
  Variables: {
    session: Session,
    session_key_rotation: boolean
  }
}>()

sessionRoutes.use('*', sessionMiddleware({
  store,
  expireAfterSeconds: 900, // delete session after 15 minutes of inactivity
  encryptionKey: 'password_that_is_at_least_32_characters_long' // Required while using CookieStore. Please use a secure, un-guessable password!
}))

sessionRoutes.post('/login', async (c) => {
  const session = c.get('session')

  const { email, password } = await c.req.parseBody()

  if (password === 'correct') {
    c.set('session_key_rotation', true)
    session.set('email', email)
    session.set('failed-login-attempts', null)
    session.flash('message', 'Login Successful')
  } else {
    const failedLoginAttempts = (session.get('failed-login-attempts') || 0) as number
    session.set('failed-login-attempts', failedLoginAttempts + 1)
    session.flash('error', 'Incorrect username or password')
  }

  return c.redirect('/')
})

sessionRoutes.post('/logout', (c) => {
  c.get('session').deleteSession()
  return c.redirect('/')
})

sessionRoutes.get('/', (c) => {
  const session = c.get('session')

  const message = session.get('message') || ''
  const error = session.get('error') || ''
  const failedLoginAttempts = session.get('failed-login-attempts')
  const email = session.get('email')

  return c.html(`<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hono Sessions</title>
    </head>
    <body>
      <p>${message}</p>
      <p>${error}</p>
      <p>${failedLoginAttempts ? `Failed login attempts: ${failedLoginAttempts}` : ''}</p>

      ${email ? 
      `<form id="logout" action="/logout" method="post">
          <button name="logout" type="submit">Log out ${email}</button>
      </form>`
      : 
      `<form id="login" action="/login" method="post">
          <p>
              <input id="email" name="email" type="text" placeholder="you@email.com">
          </p>
          <p>
              <input id="password" name="password" type="password" placeholder="password">
          </p>
          <button name="login" type="submit">Log in</button>
      </form>` 
      }
    </body>
  </html>`)
})

app.route('/', sessionRoutes)

export default app
```

### Deno

There is a Deno package available on `deno.land/x`.

```ts
import { Hono } from 'https://deno.land/x/hono/mod.ts'
import { sessionMiddleware, CookieStore, Session } from 'https://deno.land/x/hono_sessions/mod.ts'

// Same as CF Workers, however instead of:
// export default app
// use:

Deno.serve(app.fetch)
```

### Bun
```ts
import { Hono } from 'hono'
import { sessionMiddleware, CookieStore, Session } from 'hono-sessions'

// Same as CF Workers, however instead of:
// export default app
// use:

export default {
  port: 3000,
  fetch: app.fetch
}
```

## Contributing

This package is built Deno-first, so you'll need to have Deno installed in your development environment. See their [website](https://deno.com/) for installation instructions specific to your platform.

Once Deno is installed, there is a test server you can run a basic web server to check your changes:

```
deno run --allow-net --watch test/server_deno.ts
```