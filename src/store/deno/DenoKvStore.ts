import Store from '../Store.ts'
import { SessionData } from '../../Session.ts'

export class DenoKvStore implements Store {
  kv: Deno.Kv
  collectionName: string

  constructor(kv: Deno.Kv, collectionName = 'sessions') {
    this.kv = kv
    this.collectionName = collectionName
  }

  async getSessionById(sessionId: string) {
    let session = (await this.kv.get([this.collectionName, sessionId])).value
    return session as SessionData
  }

  async createSession(sessionId: string, initialData: SessionData) {
    await this.kv.set([this.collectionName, sessionId], initialData)
  }

  async deleteSession(sessionId: string){
    await this.kv.delete([this.collectionName, sessionId])
  }

  async persistSessionData(sessionId: string, sessionData: SessionData) {
    await this.kv.set([this.collectionName, sessionId], sessionData)
  }
}