import { createHonoApp } from './setup_app.ts'

const app = await createHonoApp('memory', 'password_at_least_32_characters_long')

Deno.serve(app.fetch)