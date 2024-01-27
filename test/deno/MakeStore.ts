import { Store, CookieStore, MemoryStore } from '../../mod.ts'
import { DenoKvStore } from '../../src/store/deno/DenoKvStore.ts'
import { DenoSqliteStore } from '../../src/store/deno/DenoSqliteStore.ts'
import { DB } from 'https://deno.land/x/sqlite@v3.8/mod.ts'

export async function MakeDenoStore(storeDriver: string | undefined): Promise<Store | CookieStore> {
  let store: Store | CookieStore
  
  switch(storeDriver) {
    case 'memory':
      store = new MemoryStore()
      break
    case 'cookie':
      store = new CookieStore()
      break
    case 'kv': {
      const kv = await Deno.openKv('./tmp/sessions')
      store = new DenoKvStore(kv)
      break
    }
    case 'sqlite': {
      const sqlite = new DB('./tmp/sessions.sqlite')
      store = new DenoSqliteStore(sqlite)
      break
    }
    default:
      store = new MemoryStore()
      break
  }

  return store
}