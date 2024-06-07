interface SessionDataEntry<T> {
  value: T,
  flash: boolean
}

export interface SessionData<T> {
  _data: Record<string, SessionDataEntry<T>>,
  _expire: string | null,
  _delete: boolean,
  _accessed: string | null,
}

export class Session<T> {

  private cache: SessionData<T>

  constructor() {
    this.cache = {
      _data: {},
      _expire: null,
      _delete: false,
      _accessed: null,
    }
  }

  setCache(cache_data: SessionData<T>) {
    this.cache = cache_data
  }

  getCache(): SessionData<T> {
    return this.cache
  }

  setExpiration(expiration: string) {
    this.cache._expire = expiration
  }

  reupSession(expiration: number | null | undefined) {
    if (expiration) {
      this.setExpiration(new Date(Date.now() + expiration * 1000).toISOString())
    }
  }

  deleteSession() {
    this.cache._delete = true
  }

  sessionValid(): boolean {
    return this.cache._expire == null || Date.now() < new Date(this.cache._expire).getTime()
  }

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

  flash<K extends keyof T>(key: K, value: T[K]) {
    const entry: SessionDataEntry<T> = {
      value: value as T,
      flash: true
    }

    this.cache._data[key as string] = entry
  }
}
