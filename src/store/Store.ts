export default interface Store {
  getSessionById(sessionId?: string) : Record<string, unknown> | null | undefined | Promise<Record<string, unknown> | null | undefined>
  createSession(sessionId: string, initialData: Record<string, unknown>) : Promise<void> | void
  persistSessionData(sessionId: string, sessionData: Record<string, unknown>) : Promise<void> | void
  deleteSession(sessionId: string) : Promise<void> | void
}