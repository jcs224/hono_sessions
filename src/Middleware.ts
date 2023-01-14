import Session from './Session.ts'
import { nanoid } from '../deps.ts'
import { Handler, Context } from '../deps.ts'
import Store from './store/Store.ts'
import CookieStore from './store/CookieStore.ts'
import { decryptFromBase64, encryptToBase64 } from '../mod.ts'

interface SessionOptions {
  store: Store | CookieStore
  encryptionKey?: CryptoKey | null
}

async function createSession(c: Context, store: Store | CookieStore) {
  const sid = await nanoid(21)
  const session_data = {}
  store instanceof CookieStore ? await store.createSession(c, session_data) : store.createSession(sid, session_data)

  return {sid, session_data}
}

export function sessionMiddleware(options: SessionOptions) {

  const store = options.store
  const encryptionKey = options.encryptionKey

  const middleware: Handler = async (c, next) => {
    const session = new Session
    let sid: string
    let session_data: Record<string, unknown>
  
    if (c.req.cookie('session')) {
      sid = encryptionKey ? await decryptFromBase64(encryptionKey, c.req.cookie('session')) : c.req.cookie('session')
      session_data = (store instanceof CookieStore ? await store.getSession(c) : store.getSessionById(sid)) as Record<string, unknown>
      if (!session_data) {
        const createdSession = await createSession(c, store)
        sid = createdSession.sid
        session_data = createdSession.session_data
      }
    } else {
      const createdSession = await createSession(c, store)
      sid = createdSession.sid
      session_data = createdSession.session_data
    }
  
    c.cookie('session', encryptionKey ? await encryptToBase64(encryptionKey, sid) : sid)
    session.setCache(session_data)
    c.set('session', session)
  
    await next()
    
    const session_cache = session.getCache()
    store instanceof CookieStore ? await store.persistSessionData(c, session_cache) : store.persistSessionData(sid, session_cache)
  }

  return middleware
}