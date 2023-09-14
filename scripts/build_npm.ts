// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt@0.38.1/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts", {
    name: './bun-sqlite-store',
    path: './src/store/bun/BunSqliteStore.ts'
  }, {
    name: './cloudflare-d1-store',
    path: './src/store/cloudflare/CloudflareD1Store.ts'
  }],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    // deno: true,
    // crypto: true,
  },
  package: {
    // package.json properties
    name: "hono-sessions",
    version: Deno.args[0],
    description: "Cookie-based sessions for Hono web framework",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/jcs224/hono_sessions.git",
    },
    bugs: {
      url: "https://github.com/jcs224/hono_sessions/issues",
    },
  },
  // typeCheck: false,
  // scriptModule: false,
  test: false,
  compilerOptions: {
    lib: ['DOM', 'ES2022']
  },

  mappings: {
    'https://deno.land/x/hono@v3.5.8/mod.ts': {
      name: 'hono',
      version: "3.5.8",
    },
    'https://deno.land/x/hono@v3.5.8/helper/cookie/index.ts': {
      name: 'hono',
      version: "3.5.8",
      subPath: 'cookie'
    },
    'https://deno.land/x/hono@v3.5.8/utils/cookie.ts': {
      name: 'hono',
      version: "3.5.8",
      subPath: 'utils/cookie'
    }
  }
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");