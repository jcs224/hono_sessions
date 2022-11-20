import Session from './Session.ts'
import { nanoid } from '../deps.ts'
import { Handler } from '../deps.ts'
import Store from './store/Store.ts'
import CookieStore from './store/CookieStore.ts'

export function sessionMiddleware(store: Store | CookieStore) {

  const middleware: Handler = async (c, next) => {
    const session = new Session
    let sid: string
    let session_data: Record<string, unknown>
  
    if (c.req.cookie('session')) {
      sid = c.req.cookie('session')
      session_data = (store instanceof CookieStore ? store.getSession(c) : store.getSessionById(sid)) as Record<string, unknown>
      if (!session_data) {
        sid = await nanoid(21)
        session_data = {}
        store instanceof CookieStore ? store.createSession(c, session_data) : store.createSession(sid, session_data)
      }
    } else {
      sid = await nanoid(21)
      session_data = {}
      store instanceof CookieStore ? store.createSession(c, session_data) : store.createSession(sid, session_data)
    }
  
    c.cookie('session', sid)
    session.setCache(session_data)
    c.set('session', session)
  
    await next()
    
    const session_cache = session.getCache()
    store instanceof CookieStore ? store.persistSessionData(c, session_cache) : store.persistSessionData(sid, session_cache)
  }

  return middleware
}