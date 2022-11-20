import { Hono } from 'https://deno.land/x/hono@v2.5.1/mod.ts'
import { serve } from 'https://deno.land/std@0.164.0/http/server.ts'
import { sessionMiddleware as session, CookieStore, MemoryStore } from '../mod.ts'

const app = new Hono()
const store = new CookieStore

app.post('/increment', session(store), (c) => {
  const session = c.get('session')
  session.set('count', session.get('count') + 1)
  return c.redirect('/')
})

app.post('/decrement', session(store), (c) => {
  const session = c.get('session')
  session.set('count', session.get('count') - 1)
  return c.redirect('/')
})

app.get('/', session(store), (c) => {
  const session = c.get('session')
  
  if (!session.get('count')) {
    session.set('count', 0)
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
  </body>
  </html>`)
})

serve(app.fetch)