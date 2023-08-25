import { Iron } from '../deps.ts'

export async function encrypt(password: string, payload: Object | string) {
  return await Iron.seal(globalThis.crypto, payload, password, Iron.defaults)
}

export async function decrypt(password:string, encrypted: string) {
  return await Iron.unseal(globalThis.crypto, encrypted, {default: password}, Iron.defaults)
}