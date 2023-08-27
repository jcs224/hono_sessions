import { Hono } from 'https://deno.land/x/hono@v3.5.1/mod.ts'
import { html } from 'https://deno.land/x/hono@v3.5.1/helper.ts'
import { sessionMiddleware as session, CookieStore, MemoryStore, Session } from '../mod.ts'
import 'https://deno.land/std@0.198.0/dotenv/load.ts'

const app = new Hono()

const store = new CookieStore()

// const store = new MemoryStore()

const session_routes = new Hono<{
  Variables: {
    session: Session,
    session_key_rotation: boolean
  }
}>()

session_routes.use('*', session({
  store, 
  encryptionKey: Deno.env.get('APP_KEY'), 
  expireAfterSeconds: 30,
  cookieOptions: {
    sameSite: 'Lax',
  },
}))

session_routes.post('/login', async (c) => {
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

session_routes.post('/logout', (c) => {
  c.get('session').deleteSession()
  return c.redirect('/')
})

session_routes.get('/', (c) => {
  const session = c.get('session')

  const message = session.get('message') || ''
  const error = session.get('error') || ''
  const failedLoginAttempts = session.get('failed-login-attempts')
  const email = session.get('email')

  return c.html(html`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hono Sessions</title>
  </head>
  <body>
        <p>
            ${message}
        </p>
        <p>
            ${error}
        </p>
        <p>
            ${failedLoginAttempts ? `Failed login attempts: ${failedLoginAttempts}` : ''}
        </p>

        ${email ? 
        html`<form id="logout" action="/logout" method="post">
            <button name="logout" type="submit">Log out ${email}</button>
        </form>`
        : 
        html`<form id="login" action="/login" method="post">
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

app.route('/', session_routes)

Deno.serve(app.fetch)