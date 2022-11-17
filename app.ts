import { Hono } from 'http://deno.land/x/hono@v2.5.1/mod.ts'
import { serve } from 'https://deno.land/std@0.164.0/http/server.ts'
import Session from './session.ts'
import MemoryStore from './memory_store.ts'
import { nanoid } from 'https://deno.land/x/nanoid@v3.0.0/async.ts'

const app = new Hono()
const store = new MemoryStore

app.use(async (c, next) => {
  const session = new Session
  let sid: string
  let session_data: Record<string, unknown>

  if (c.req.cookie('session')) {
    sid = c.req.cookie('session')
    session_data = store.getSessionByID(sid) as Record<string, unknown>
    if (!session_data) {
      sid = await nanoid(21)
      session_data = {}
      store.createSession(sid, session_data)
    }
  } else {
    sid = await nanoid(21)
    session_data = {}
    store.createSession(sid, session_data)
  }

  c.cookie('session', sid)
  session.setCache(session_data)
  c.set('session', session)

  await next()
  
  const session_cache = session.getCache()
  store.persistSessionData(sid, session_cache)
})

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