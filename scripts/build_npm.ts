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
    version: Deno.args[0]?.replace('v', ''),
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
  }
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
Deno.copyFileSync("extras/.npmignore", "npm/.npmignore")