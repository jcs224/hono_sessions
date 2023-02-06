import { Context } from '../../deps.ts'
import { decryptFromBase64, encryptToBase64 } from '../../mod.ts'

interface CookieStoreOptions {
  encryptionKey?: CryptoKey | null
}
class CookieStore {
  private encryptionKey: CryptoKey | null | undefined

  constructor(options?: CookieStoreOptions) {
    this.encryptionKey = options?.encryptionKey
  }

  async getSession(c: Context) {
    return JSON.parse(this.encryptionKey ? await decryptFromBase64(this.encryptionKey, c.req.cookie('session')) : c.req.cookie('session'))
  }

  async createSession(c: Context, initial_data: Record<string, unknown>) {
    const stringified_data = JSON.stringify(initial_data)
    c.cookie('session', this.encryptionKey ? await encryptToBase64(this.encryptionKey, stringified_data) : stringified_data)
  }

  async deleteSession(c: Context) {
    c.cookie('session', this.encryptionKey ? await encryptToBase64(this.encryptionKey, '') : '')
  }

  async persistSessionData(c: Context, session_data: Record<string, unknown>) {
    const stringified_data = JSON.stringify(session_data)
    c.cookie('session', this.encryptionKey ? await encryptToBase64(this.encryptionKey, stringified_data) : stringified_data)
  }
}

export default CookieStore