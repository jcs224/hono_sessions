import { hash } from '../deps.ts'

interface SessionDataEntry<T> {
  value: T,
  flash: boolean
}

export interface SessionData<T = any> {
  _id?: string, // No id used with cookie store
  _data: Record<string, SessionDataEntry<T>>,
  _expire: string | null,
  _delete: boolean,
  _accessed: string | null,
}

export class Session<T = any> {

  private cache: SessionData<T>
  private expiration: number | undefined
  private hash: string | null = null

  constructor(expiration?: number) {
    this.expiration = expiration
    this.cache = {
      _data: {},
      _expire: null,
      _delete: false,
      _accessed: null,
    }
  }

  setCache(cache_data: SessionData<T>, isNew: boolean = false) {
    this.hash = !isNew ? hash(cache_data) : null
    this.cache = cache_data
  }

  isStale(): boolean {
    return !this.hash || this.hash !== hash(this.cache)
  }

  getCache(): SessionData<T> {
    return this.cache
  }

  setExpiration(expiration: string) {
    this.cache._expire = expiration
  }

  /**
   * Extend expiration
   */
  reupSession() {
    if (this.expiration) {
      this.setExpiration(new Date(Date.now() + this.expiration * 1000).toISOString())
    }
  }

  /**
   * Extend session expiration and update access time
   */
  touch() {
    this.reupSession()
    this.updateAccess()
  }

  deleteSession() {
    this.cache._delete = true
  }

  sessionValid(): boolean {
    return this.cache._expire == null || Date.now() < new Date(this.cache._expire).getTime()
  }

  /**
   * Update the last accessed time
   */
  updateAccess() {
    this.cache._accessed = new Date().toISOString()
  }

  get<K extends keyof T>(key: K): T[K] | null {
    const entry = this.cache._data[key as string]

    if (entry) {
      const value = entry.value
      if (entry.flash) {
        delete this.cache._data[key as string]
      }

      return value as T[K]
    } else {
      return null
    }
  }

  set<K extends keyof T>(key: K, value: T[K]) {
    const entry: SessionDataEntry<T> = {
      value: value as T,
      flash: false
    }

    this.cache._data[key as string] = entry
  }

  forget<K extends keyof T>(key: K) {
    const entry = this.cache._data[key as string]
    if (!entry) return
    delete this.cache._data[key as string]
  }

  flash<K extends keyof T>(key: K, value: T[K]) {
    const entry: SessionDataEntry<T> = {
      value: value as T,
      flash: true
    }

    this.cache._data[key as string] = entry
  }
}
