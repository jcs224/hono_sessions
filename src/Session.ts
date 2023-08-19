interface SessionDataEntry {
  value: unknown,
  flash: boolean
}

export interface SessionData {
  _data: Record<string, SessionDataEntry>,
  _expire: string | null,
  _delete: boolean,
  _accessed: string | null,
}

export class Session {

  private cache: SessionData

  constructor() {
    this.cache = {
      _data: {},
      _expire: null,
      _delete: false,
      _accessed: null,
    }
  }

  setCache(cache_data: SessionData) {
    this.cache = cache_data
  }

  getCache() {
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

  sessionValid() {
    return this.cache._expire == null || Date.now() < new Date(this.cache._expire).getTime()
  }

  updateAccess() {
    this.cache._accessed = new Date().toISOString()
  }

  get(key: string) {
    const entry = this.cache._data[key]

    if (entry) {
      const value = entry.value
      if (entry.flash) {
        delete this.cache._data[key]
      }
  
      return value
    } else {
      return null
    }
  }

  set(key: string, value: unknown) {
    this.cache._data[key] = {
      value,
      flash: false
    }
  }

  flash(key: string, value: unknown) {
    this.cache._data[key] = {
      value,
      flash: true
    }
  }
}