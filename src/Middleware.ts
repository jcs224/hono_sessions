import { MiddlewareHandler, nanoid } from '../deps.ts'
import { getCookie, setCookie, createMiddleware } from '../deps.ts'
import Store from './store/Store.ts'
import CookieStore from './store/CookieStore.ts'
import { Session, SessionData, encrypt, decrypt } from '../mod.ts'
import { CookieOptions } from '../deps.ts';

interface SessionOptions {
  store: Store | CookieStore
  encryptionKey?: string,
  expireAfterSeconds?: number,
  cookieOptions?: CookieOptions,
  sessionCookieName?: string
}

export function sessionMiddleware(options: SessionOptions): MiddlewareHandler<any, any, {}> {

  const store = options.store
  const encryptionKey = options.encryptionKey
  const expireAfterSeconds = options.expireAfterSeconds
  const cookieOptions = options.cookieOptions
  const sessionCookieName = options.sessionCookieName || 'session'

  if (store instanceof CookieStore) {
    store.sessionCookieName = sessionCookieName
  
    if (encryptionKey) {
      store.encryptionKey = encryptionKey
    } else {
      throw new Error('encryptionKey is required while using CookieStore. encryptionKey must be at least 32 characters long.')
    }
  
    if (cookieOptions) {
      store.cookieOptions = cookieOptions
    }
  }

  const middleware = createMiddleware(async (c, next) => {
    const session = new Session
    let sid = ''
    let session_data: SessionData | null | undefined
    let createNewSession = false

    const sessionCookie = getCookie(c, sessionCookieName)
  
    if (sessionCookie) { // If there is a session cookie present...

      if (store instanceof CookieStore) {
        session_data = await store.getSession(c)
      } else {
        try {
          sid = (encryptionKey ? await decrypt(encryptionKey, sessionCookie) : sessionCookie) as string
          session_data = await store.getSessionById(sid)
        } catch {
          createNewSession = true
        }
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
      setCookie(c, sessionCookieName, encryptionKey ? await encrypt(encryptionKey, sid) : sid, cookieOptions)
    }

    session.updateAccess()

    c.set('session', session)

    await next()

    const shouldDelete = session.getCache()._delete;
    const shouldRotateSessionKey = c.get("session_key_rotation") === true;
    const storeIsCookieStore = store instanceof CookieStore;
    
    if (shouldDelete) {
      store instanceof CookieStore
        ? await store.deleteSession(c)
        : await store.deleteSession(sid);
    }

    /*
     * Only update session data if we didn't just delete it.
     * If session key rotation is enabled and the store is not a CookieStore,
     * we need to roate the session key by deleting the old session and creating a new one.
     */
    const shouldRecreateSessionForNonCookieStore =
      !shouldDelete &&
      !storeIsCookieStore &&
      shouldRotateSessionKey;

    if (shouldRecreateSessionForNonCookieStore) {
      await store.deleteSession(sid);
      sid = await nanoid(21);
      await store.createSession(sid, session.getCache());

      setCookie(
        c,
        sessionCookieName,
        encryptionKey ? await encrypt(encryptionKey, sid) : sid,
        cookieOptions
      );
    }

    /*
     * We skip session data persistence if it was just deleted.
     * Only persist if we didn't just rotate the session key,
     * or the store is a CookieStore (which does not have its session key rotated)
     */
    const shouldPersistSession =
      !shouldDelete &&
      (!shouldRotateSessionKey || storeIsCookieStore);

    if (shouldPersistSession) {
      store instanceof CookieStore
        ? await store.persistSessionData(c, session.getCache())
        : await store.persistSessionData(sid, session.getCache());
    }
  })

  return middleware
}