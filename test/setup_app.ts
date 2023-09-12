import { Hono } from 'https://deno.land/x/hono@v3.5.8/mod.ts'
import { getSessionRoutes } from './session_routes.ts'
import { MakeStore } from './MakeStore.ts'

export async function createHonoApp(storeDriver?: string | undefined, encryptionKey?: string | undefined) {
  const app = new Hono()
  const store = await MakeStore(storeDriver)
  const session_routes = getSessionRoutes(store, encryptionKey)
  app.route('/', session_routes)

  return app
}