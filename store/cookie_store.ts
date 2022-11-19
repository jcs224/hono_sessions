import { Context } from 'https://deno.land/x/hono@v2.5.1/mod.ts'

class CookieStore {
  getSession(c: Context) {
    return JSON.parse(c.req.cookie('session_data'))
  }

  createSession(c: Context, initial_data: Record<string, unknown>) {
    const stringified_data = JSON.stringify(initial_data)
    c.cookie('session_data', stringified_data)
  }

  deleteSession(c: Context) {
    c.cookie('session_data', '')
  }

  persistSessionData(c: Context, session_data: Record<string, unknown>) {
    const stringified_data = JSON.stringify(session_data)
    c.cookie('session_data', stringified_data)
  }
}

export default CookieStore