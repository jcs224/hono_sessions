import { Iron } from '../deps.ts'

/** 
 * Encrypt a string or object value
 * 
 * @param password Random string at least 32 characters long
 * @param payload String or object to encrypt
 * @returns A promise of the encrypted string
 */
export async function encrypt(password: string, payload: object | string): Promise<string> {
  return await Iron.seal(globalThis.crypto, payload, password, Iron.defaults)
}

/**
 * Decrypt an encrypted payload
 * 
 * @param password Random string at least 32 characters long
 * @param encrypted Encrypted string
 * @returns Promise of the unencrypted value (string or object in most cases)
 */
export async function decrypt(password:string, encrypted: string): Promise<unknown> {
  return await Iron.unseal(globalThis.crypto, encrypted, {default: password}, Iron.defaults)
}