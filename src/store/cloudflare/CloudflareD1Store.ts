import Store from '../Store.ts'
import { SessionData } from '../../Session.ts'

export class CloudflareD1Store implements Store {
  db: any
  tableName: string
  
  constructor(tableName: string = 'sessions') {
    this.tableName = tableName
  }

  async getSessionById(sessionId?: string|undefined) {
    const session = await this.db.prepare(`SELECT data FROM ${ this.tableName } WHERE id = ?`)
      .bind(sessionId)
      .first('data')
      
    if (session) {
      return JSON.parse(session)
    } else {
      return null
    }
  }

  async createSession(sessionId: string,initialData: SessionData) {
    await this.db.prepare(`INSERT INTO ${ this.tableName } (id, data) VALUES (?, ?)`).bind(sessionId, JSON.stringify(initialData)).run()
  }

  async deleteSession(sessionId: string) {
    await this.db.prepare(`DELETE FROM ${ this.tableName } WHERE id = ?`).bind(sessionId).run()
  }

  async persistSessionData(sessionId: string, sessionData: SessionData) {
    await this.db.prepare(`UPDATE ${ this.tableName } SET data = ? WHERE id = ?`).bind(JSON.stringify(sessionData), sessionId).run()
  }
}