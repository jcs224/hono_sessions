import Store from '../Store.ts'
import { SessionData } from '../../Session.ts'

export class BunSqliteStore implements Store {
  db: any
  tableName: string

  constructor(db: any, tableName = 'sessions') {
    this.db = db
    this.tableName = tableName
    const query = db.query(`CREATE TABLE IF NOT EXISTS ${ tableName } (id TEXT PRIMARY KEY, data TEXT)`)
    query.run()
  }

  getSessionById(sessionId: string) {
    const query = this.db.query(`SELECT data FROM ${ this.tableName } WHERE id = $id`)
    const result = query.get({ $id: sessionId })
    
    if (result) {
      return JSON.parse(result.data)
    } else {
      return null
    }
  }

  createSession(sessionId: string,initialData: SessionData) {
    const query = this.db.query(`INSERT INTO ${ this.tableName } (id, data) VALUES ($id, $data)`)
    query.run({ $id: sessionId, $data: JSON.stringify(initialData) })
  }

  deleteSession(sessionId: string) {
    const query = this.db.query(`DELETE FROM ${ this.tableName } WHERE id = $id`)
    query.run({ $id: sessionId})
  }

  persistSessionData(sessionId: string,sessionData: SessionData) {
    const query = this.db.query(`UPDATE ${ this.tableName } SET data = $data WHERE id = $id`)
    query.run({ $id: sessionId, $data: JSON.stringify(sessionData) })
  }
}