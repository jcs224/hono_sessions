import Session from './Session.ts'
import { nanoid } from '../deps.ts'
import { MiddlewareHandler, Context, getCookie, setCookie } from '../deps.ts'
import Store from './store/Store.ts'
import CookieStore from './store/CookieStore.ts'
import { decryptFromBase64, encryptToBase64 } from '../mod.ts'

interface SessionOptions {
  store: Store | CookieStore
  encryptionKey?: CryptoKey | null
}

export function sessionMiddleware(options: SessionOptions) {

  const store = options.store
  const encryptionKey = options.encryptionKey

  const middleware: MiddlewareHandler = async (c, next) => {
    const session = new Session
    let sid: string = ''
    let session_data: Record<string, unknown> = {}
    let createNewSession = false

    const sessionCookie = getCookie(c, 'session')
  
    if (sessionCookie) { // If there is a session cookie present...

      if (store instanceof CookieStore) {
        session_data = await store.getSession(c)
      } else {
        sid = encryptionKey ? await decryptFromBase64(encryptionKey, sessionCookie) : sessionCookie
        session_data = await store.getSessionById(sid) || {}
      }

      if (!session_data) {
        createNewSession = true
      }
    } else {
      createNewSession = true
    }

    if (createNewSession) {
      if (store instanceof CookieStore) {
        await store.createSession(c, session_data)
      } else {
        sid = await nanoid(21)
        await store.createSession(sid, session_data)
      }
    }
  
    if (!(store instanceof CookieStore)) {
      setCookie(c, 'session', encryptionKey ? await encryptToBase64(encryptionKey, sid) : sid)
    }

    session.setCache(session_data)
    c.set('session', session)
  
    await next()
    
    const session_cache = session.getCache()
    store instanceof CookieStore ? await store.persistSessionData(c, session_cache) : store.persistSessionData(sid, session_cache)
  }

  return middleware
}