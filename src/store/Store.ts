import { SessionData } from "../../mod.ts"

export default interface Store {
  getSessionById(sessionId?: string) : SessionData | null | undefined | Promise<SessionData | null | undefined>
  createSession(sessionId: string, initialData: SessionData) : Promise<void> | void
  persistSessionData(sessionId: string, sessionData: SessionData) : Promise<void> | void
  deleteSession(sessionId: string) : Promise<void> | void
}