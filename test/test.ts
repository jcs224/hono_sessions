import app from './setup_memory.ts'
import { assert, assertEquals } from 'https://deno.land/std@0.200.0/assert/mod.ts'

Deno.test('Memory Store: establish session', async () => {
  const res = await app.request('/')

  const sessionCookies = res.headers.getSetCookie().filter(entry => entry.includes('session='))

  assert(sessionCookies.length > 0)

  const next_res = await app.request('/', {
    headers: {
      'Cookie': sessionCookies[0]
    }
  })

  const nextSessionCookies = next_res.headers.getSetCookie().filter(entry => entry.includes('session='))

  assert(nextSessionCookies.length > 0)

  assertEquals(sessionCookies[0], nextSessionCookies[0])
})