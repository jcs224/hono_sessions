import { Store, CookieStore, MemoryStore } from "../mod.ts";
import { DenoKvStore } from "../src/store/deno/DenoKvStore.ts";

export async function MakeStore(storeDriver: string | undefined): Promise<Store | CookieStore> {
  let store: Store | CookieStore
  
  switch(storeDriver) {
    case 'memory':
      store = new MemoryStore()
      break
    case 'cookie':
      store = new CookieStore()
      break
    case 'kv':
      const kv = await Deno.openKv('./tmp/sessions')
      store = new DenoKvStore(kv)
    default:
      store = new MemoryStore()
      break
  }

  return store
}