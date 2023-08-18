import { Hono } from 'https://deno.land/x/hono@v3.4.3/mod.ts'
import { serve } from 'https://deno.land/std@0.164.0/http/server.ts'
import { sessionMiddleware as session, CookieStore, MemoryStore, Session } from '../mod.ts'
import { createKeyFromBase64 } from '../mod.ts'
import 'https://deno.land/std@0.165.0/dotenv/load.ts'

const app = new Hono()

const key = Deno.env.get('APP_KEY')
  ? await createKeyFromBase64(Deno.env.get('APP_KEY')) 
  : null

const store = new CookieStore({
  encryptionKey: key
})

// const store = new MemoryStore()

const session_routes = new Hono<{
  Variables: {
    session: Session
  }
}>()

session_routes.use('*', session({store, encryptionKey: key}))

session_routes.post('/increment', (c) => {
  const session = c.get('session')
  let count = session.get('count') as number
  session.set('count', count + 1)
  return c.redirect('/')
})

session_routes.post('/decrement', (c) => {
  const session = c.get('session')
  let count = session.get('count') as number
  session.set('count', count - 1)
  return c.redirect('/')
})

session_routes.post('/increment2', (c) => {
  const session = c.get('session')
  let count = session.get('count2') as number
  session.set('count2', count + 1)
  return c.redirect('/')
})

session_routes.post('/decrement2', (c) => {
  const session = c.get('session')
  let count = session.get('count2') as number
  session.set('count2', count - 1)
  return c.redirect('/')
})

session_routes.get('/', (c) => {
  const session = c.get('session')
  
  if (!session.get('count')) {
    session.set('count', 0)
  }

  if (!session.get('count2')) {
    session.set('count2', 0)
  }

  return c.html(`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hono Sessions</title>
  </head>
  <body>
    <h1>Counter</h1>
    <p>Counter: ${ session.get('count') }</p>
    <form action="/increment" method="post">
      <button type="submit">Increment</button>
    </form>
    <form action="/decrement" method="post">
      <button type="submit">Decrement</button>
    </form>
    <p>Counter 2: ${ session.get('count2') }</p>
    <form action="/increment2" method="post">
      <button type="submit">Increment</button>
    </form>
    <form action="/decrement2" method="post">
      <button type="submit">Decrement</button>
    </form>
  </body>
  </html>`)
})

app.route('/', session_routes)

serve(app.fetch)