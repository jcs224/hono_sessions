export function runtimeCommand() {
  let command: string
  let server_url: string

  switch(process.env.JS_RUNTIME) {
    case 'deno':
      command = `cd ../test/deno && deno run -A ${ process.env.STORE === 'kv' ? '--unstable ': '' }server_deno.ts`
      server_url = 'http://127.0.0.1:8000'
      break
    case 'bun':
      command = `cd ../test/bun && bun run src/index.ts`
      server_url = 'http://127.0.0.1:8000'
      break
    case 'cf_workers':
      command = `cd ../test/cloudflare_workers && npm run dev`
      server_url = 'http://127.0.0.1:8787'
      break
    default: // Deno by default
      command = `cd ../test/deno && deno run -A ${ process.env.STORE === 'kv' ? '--unstable ': '' }server_deno.ts`
      server_url = 'http://127.0.0.1:8000'
  }

  return {
    command,
    server_url
  }
}