import { Context, getCookie, setCookie, CookieOptions } from '../../deps.ts'
import { encrypt, decrypt, SessionData } from '../../mod.ts'

interface CookieStoreOptions {
  encryptionKey?: string | null,
  cookieOptions?: CookieOptions,
  sessionCookieName: string
}

/**
 * Cookie storage driver class
 */
class CookieStore {
  public encryptionKey: string | null | undefined
  public cookieOptions: CookieOptions | undefined
  public sessionCookieName: string

  constructor(options?: CookieStoreOptions) {
    this.encryptionKey = options?.encryptionKey
    this.cookieOptions = options?.cookieOptions
    this.sessionCookieName = options?.sessionCookieName || 'session'
  }

  async getSession(c: Context): Promise<SessionData | null> {
    let session_data_raw: string

    const sessionCookie = getCookie(c, this.sessionCookieName, this.cookieOptions?.prefix)

    if (this.encryptionKey && sessionCookie) {
      // Decrypt cookie string. If decryption fails, return null
      try {
        session_data_raw = (await decrypt(this.encryptionKey, sessionCookie)) as string
      } catch {
        return null
      }

      // Parse session object from cookie string and return result. If fails, return null
      try {
        const session_data = JSON.parse(session_data_raw) as SessionData
        return session_data
      } catch {
        return null
      }
    } else {
      return null
    }
  }

  async createSession(c: Context, initial_data: SessionData) {
    const stringified_data = JSON.stringify(initial_data)
    setCookie(c, this.sessionCookieName, this.encryptionKey ? await encrypt(this.encryptionKey, stringified_data) : stringified_data, this.cookieOptions)
  }

  async deleteSession(c: Context) {
    setCookie(c, this.sessionCookieName, this.encryptionKey ? await encrypt(this.encryptionKey, '') : '', this.cookieOptions)
  }

  async persistSessionData(c: Context, session_data: SessionData) {
    const stringified_data = JSON.stringify(session_data)
    setCookie(c, this.sessionCookieName, this.encryptionKey ? await encrypt(this.encryptionKey, stringified_data) : stringified_data, this.cookieOptions)
  }
}

export default CookieStore