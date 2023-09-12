import { createHonoApp } from './setup_app.ts'
import { assert, assertEquals } from 'https://deno.land/std@0.200.0/assert/mod.ts'
import { encrypt, decrypt } from '../src/Crypto.ts'

Deno.test('Memory Store: establish session', async () => {
  const app = await createHonoApp('memory')
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

Deno.test('Memory Store: establish session with encryption', async () => {
  const key = 'password_at_least_32_characters_long'

  const app = await createHonoApp('memory', key)
  const res = await app.request('/')

  const sessionCookies = res.headers.getSetCookie().filter(entry => entry.includes('session='))

  assert(sessionCookies.length > 0)

  const session_id_encrypted = sessionCookies[0].split('session=')[1].split('; SameSite=Lax')[0]
  const sessionId = await decrypt(key, session_id_encrypted) as string

  const next_res = await app.request('/', {
    headers: {
      'Cookie': 'session=' + (await encrypt(key, sessionId))
    }
  })

  const nextSessionCookies = next_res.headers.getSetCookie().filter(entry => entry.includes('session='))

  assert(nextSessionCookies.length > 0)

  const next_session_id_encrypted = nextSessionCookies[0].split('session=')[1].split('; SameSite=Lax')[0]
  const nextSessionId = await decrypt(key, next_session_id_encrypted) as string

  assertEquals(sessionId, nextSessionId)
})