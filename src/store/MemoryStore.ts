import Store from './Store.ts'
import { SessionData } from '../../mod.ts'

/**
 * Memory storage driver class
 */
class MemoryStore implements Store {
  private data: Map<string, SessionData>

  constructor() {
    this.data = new Map
  }

  getSessionById(sid: string): SessionData | null | undefined {
    return this.data.has(sid) ? this.data.get(sid) : null
  }

  createSession(sid: string, initial_data: SessionData) {
    this.data.set(sid, initial_data)
  }

  deleteSession(sid: string) {
    this.data.delete(sid)
  }

  persistSessionData(sid: string, session_data: SessionData) {
    this.data.set(sid, session_data)
  }
}

export default MemoryStore