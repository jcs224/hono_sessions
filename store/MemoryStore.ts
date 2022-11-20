import Store from './Store.ts'

class MemoryStore implements Store {
  private data: Map<string, Record<string, unknown>>

  constructor() {
    this.data = new Map
  }

  getSessionById(sid: string) {
    return this.data.has(sid) ? this.data.get(sid) : null
  }

  createSession(sid: string, initial_data: Record<string, unknown>) {
    this.data.set(sid, initial_data)
  }

  deleteSession(sid: string) {
    this.data.delete(sid)
  }

  persistSessionData(sid: string, session_data: Record<string, unknown>) {
    this.data.set(sid, session_data)
  }
}

export default MemoryStore