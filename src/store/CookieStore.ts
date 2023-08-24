import { Context, getCookie, setCookie, CookieOptions } from '../../deps.ts'
import { decryptFromBase64, encryptToBase64, SessionData } from '../../mod.ts'

interface CookieStoreOptions {
  encryptionKey?: CryptoKey | null,
  cookieOptions?: CookieOptions
}
class CookieStore {
  public encryptionKey: CryptoKey | null | undefined
  public cookieOptions: CookieOptions | undefined

  constructor(options?: CookieStoreOptions) {
    this.encryptionKey = options?.encryptionKey
    this.cookieOptions = options?.cookieOptions
  }

  async getSession(c: Context) {
    let session_data: string

    const sessionCookie = getCookie(c, 'session')

    if (this.encryptionKey && sessionCookie) {
      session_data = await decryptFromBase64(this.encryptionKey, sessionCookie)
      if (session_data) {
        return JSON.parse(session_data)
      }
    } else {
      return null
    }
  }

  async createSession(c: Context, initial_data: SessionData) {
    const stringified_data = JSON.stringify(initial_data)
    setCookie(c, 'session', this.encryptionKey ? await encryptToBase64(this.encryptionKey, stringified_data) : stringified_data, this.cookieOptions)
  }

  async deleteSession(c: Context) {
    setCookie(c, 'session', this.encryptionKey ? await encryptToBase64(this.encryptionKey, '') : '', this.cookieOptions)
  }

  async persistSessionData(c: Context, session_data: SessionData) {
    const stringified_data = JSON.stringify(session_data)
    setCookie(c, 'session', this.encryptionKey ? await encryptToBase64(this.encryptionKey, stringified_data) : stringified_data, this.cookieOptions)
  }
}

export default CookieStore