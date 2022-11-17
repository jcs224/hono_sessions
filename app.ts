import { Hono } from 'http://deno.land/x/hono@v2.5.1/mod.ts'
import { serve } from 'https://deno.land/std@0.164.0/http/server.ts'
import MemoryStore from './memory_store.ts'
import { sessionMiddleware } from './middleware.ts'

const app = new Hono()
const store = new MemoryStore

app.use(sessionMiddleware(store))

app.get('/', (c) => {
  const session = c.get('session')
  session.set('count', (session.get('count') || 0) + 1)
  
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
    <p>You've visited ${ session.get('count') } times</p>
  </body>
  </html>`)
})

serve(app.fetch)