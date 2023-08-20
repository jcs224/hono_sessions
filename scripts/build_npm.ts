// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt@0.38.1/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
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
      url: "git+https://github.com/jcs224/hono-sessions.git",
    },
    bugs: {
      url: "https://github.com/jcs224/hono-sessions/issues",
    },
  },
  typeCheck: false,
  // scriptModule: false,
  compilerOptions: {
    lib: ['DOM', 'ES2022']
  },

  mappings: {
    'https://deno.land/x/hono@v3.4.3/mod.ts': {
      name: 'hono',
      version: "^3.4.3",
    },
    'https://deno.land/x/hono@v3.4.3/middleware/cookie/index.ts': {
      name: 'hono',
      version: "^3.4.3",
      subPath: 'cookie'
    }
  }
});

// post build steps
// Deno.copyFileSync("LICENSE", "npm/LICENSE");
// Deno.copyFileSync("README.md", "npm/README.md");