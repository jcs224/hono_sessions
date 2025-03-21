import Store from './store/Store.ts'
import CookieStore from './store/CookieStore.ts'
import { CookieOptions } from '../deps.ts';

export default interface SessionOptions {
  store: Store | CookieStore
  encryptionKey?: string | (() => string),
  expireAfterSeconds?: number,
  cookieOptions?: CookieOptions,
  sessionCookieName?: string
}