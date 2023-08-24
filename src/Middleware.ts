import { nanoid } from '../deps.ts'
import { MiddlewareHandler, Context, getCookie, setCookie } from '../deps.ts'
import Store from './store/Store.ts'
import CookieStore from './store/CookieStore.ts'
import { Session, SessionData, decryptFromBase64, encryptToBase64 } from '../mod.ts'
import { CookieOptions } from '../deps.ts';

interface SessionOptions {
  store: Store | CookieStore
  encryptionKey?: CryptoKey,
  expireAfterSeconds?: number,
  cookieOptions?: CookieOptions,
  sessionCookieName?: string
}

export function sessionMiddleware(options: SessionOptions) {

  const store = options.store
  const encryptionKey = options.encryptionKey
  const expireAfterSeconds = options.expireAfterSeconds
  const cookieOptions = options.cookieOptions
  const sessionCookieName = options.sessionCookieName || 'session'

  if (store instanceof CookieStore) {
    store.sessionCookieName = sessionCookieName
  
    if (encryptionKey) {
      store.encryptionKey = encryptionKey
    }
  
    if (cookieOptions) {
      store.cookieOptions = cookieOptions
    }
  }

  const middleware: MiddlewareHandler = async (c, next) => {
    const session = new Session
    let sid: string = ''
    let session_data: SessionData | null | undefined
    let createNewSession = false

    const sessionCookie = getCookie(c, sessionCookieName)
  
    if (sessionCookie) { // If there is a session cookie present...

      if (store instanceof CookieStore) {
        session_data = await store.getSession(c)
      } else {
        sid = encryptionKey ? await decryptFromBase64(encryptionKey, sessionCookie) : sessionCookie
        session_data = await store.getSessionById(sid)
      }

      if (session_data) {
        session.setCache(session_data)

        if (session.sessionValid()) {
          session.reupSession(expireAfterSeconds)
        } else {
          store instanceof CookieStore ? await store.deleteSession(c) : await store.deleteSession(sid)
          createNewSession = true
        }
      } else {
        createNewSession = true
      }
    } else {
      createNewSession = true
    }

    if (createNewSession) {
      const defaultData = {
        _data:{},
        _expire: null,
        _delete: false,
        _accessed: null,
      }

      if (store instanceof CookieStore) {
        await store.createSession(c, defaultData)
      } else {
        sid = await nanoid(21)
        await store.createSession(sid, defaultData)
      }

      session.setCache(defaultData)
    }
  
    if (!(store instanceof CookieStore)) {
      setCookie(c, sessionCookieName, encryptionKey ? await encryptToBase64(encryptionKey, sid) : sid, cookieOptions)
    }

    session.updateAccess()

    c.set('session', session)

    await next()

    if (c.get('session_key_rotation') === true && !(store instanceof CookieStore)) {
      await store.deleteSession(sid)
      sid = await nanoid(21)
      await store.createSession(sid, session.getCache())

      setCookie(c, sessionCookieName, encryptionKey ? await encryptToBase64(encryptionKey, sid) : sid, cookieOptions)
    }

    store instanceof CookieStore ? await store.persistSessionData(c, session.getCache()) : store.persistSessionData(sid, session.getCache())

    if (session.getCache()._delete) {
      store instanceof CookieStore ? await store.deleteSession(c) : await store.deleteSession(sid)
    }
  }

  return middleware
}