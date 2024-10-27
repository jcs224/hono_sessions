import { Store, CookieStore, MemoryStore } from '../../mod.ts'

export async function MakeDenoStore(storeDriver: string | undefined): Promise<Store | CookieStore> {
  let store: Store | CookieStore
  
  switch(storeDriver) {
    case 'memory':
      store = new MemoryStore()
      break
    case 'cookie':
      store = new CookieStore()
      break
    default:
      store = new MemoryStore()
      break
  }

  return store
}