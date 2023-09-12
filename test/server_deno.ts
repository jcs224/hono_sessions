import { createHonoApp } from './setup_app.ts'

const app = await createHonoApp()

Deno.serve(app.fetch)