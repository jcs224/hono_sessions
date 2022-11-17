class Session {

  private cache: Record<string, unknown>

  constructor() {
    this.cache = {}
  }

  setCache(cache_data: Record<string, unknown>) {
    this.cache = cache_data
  }

  getCache() {
    return this.cache
  }

  get(key: string) {
    return this.cache[key]
  }

  set(key: string, value: unknown) {
    this.cache[key] = value
  }
}

export default Session