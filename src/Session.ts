interface SessionDataEntry {
  value: unknown,
  flash: boolean
}

export interface SessionData {
  _data: Record<string, SessionDataEntry>
}

export class Session {

  private cache: SessionData

  constructor() {
    this.cache = {
      _data: {}
    }
  }

  setCache(cache_data: SessionData) {
    this.cache = cache_data
  }

  getCache() {
    return this.cache
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