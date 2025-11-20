// ex. scripts/build_npm.ts
import { build, emptyDir } from "@deno/dnt";
import { fromFileUrl, dirname, join } from '@std/path'

const version = JSON.parse(await Deno.readTextFile(dirname(fromFileUrl(import.meta.url)) + '/../deno.json')).version

const DIST_DIR = "./npm";

await emptyDir(DIST_DIR);

await build({
  entryPoints: ["./mod.ts", {
    name: './bun-sqlite-store',
    path: './src/store/bun/BunSqliteStore.ts'
  }],
  outDir: DIST_DIR,
  shims: {
    // see JS docs for overview and more options
    // deno: true,
    // crypto: true,
  },
  package: {
    // package.json properties
    name: "hono-sessions",
    version,
    description: "Cookie-based sessions for Hono web framework",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/jcs224/hono_sessions.git",
    },
    bugs: {
      url: "https://github.com/jcs224/hono_sessions/issues",
    }
  },
  // typeCheck: false,
  // scriptModule: false,
  test: false,
  compilerOptions: {
    lib: ['DOM', 'ES2022']
  }
});

const dependenciesMapping = [
  {
    name: "hono",
    version: "^4.0.0",
    peerDependency: true,
  }
];

// Patch package.json to add peer dependencies and remove dev dependencies
// This is required because dnt doesn't support peer dependencies for NPM packages yet
// See https://github.com/denoland/dnt/issues/433 for details
async function fixPeerDependencies() {
  const packageJsonPath = join(DIST_DIR, "package.json");
  const packageJson = JSON.parse(await Deno.readTextFile(packageJsonPath));

  const dependencies = packageJson.dependencies || {};
  const peerDependencies = packageJson.peerDependencies || {};

  for (const value of dependenciesMapping) {
    if (typeof value === "string") {
      continue;
    }

    const { name, version, peerDependency } = value;

    if (peerDependency) {
      peerDependencies[name] = version;
      delete dependencies[name];
    } else {
      dependencies[name] = version;
    }
  }

  packageJson.dependencies = dependencies;
  packageJson.peerDependencies = peerDependencies;

  await Deno.writeTextFile(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2),
  );
}

await fixPeerDependencies();

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
Deno.copyFileSync("extras/.npmignore", "npm/.npmignore")
