import {
  decode,
  encode,
} from "https://deno.land/std@0.165.0/encoding/base64.ts";

export async function createKeyFromBase64(key_string: string) {
  const key_decoded = decode(key_string)
  const key = await crypto.subtle.importKey('raw', key_decoded, 'AES-GCM', true, ['encrypt', 'decrypt'])
  return key
}

export async function decryptFromBase64(key: CryptoKey, base64_string: string) {
  const payload_bytes = decode(base64_string)
  const iv = payload_bytes.slice(0, 12)
  const encrypted_payload_bytes = payload_bytes.slice(12, payload_bytes.length)

  const decrypted_payload = await crypto.subtle.decrypt(
    {
      'name': key.algorithm.name,
      iv
    },
    key,
    encrypted_payload_bytes
  )

  return (new TextDecoder).decode(decrypted_payload)
}

export async function encryptToBase64(key: CryptoKey, raw_string: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted_payload = await crypto.subtle.encrypt(
    {
      name: key.algorithm.name,
      iv
    },
    key,
    (new TextEncoder).encode(raw_string)
  )

  const encrypted_payload_bytes = new Uint8Array(encrypted_payload)
  const payload_bytes = new Uint8Array(encrypted_payload_bytes.length + iv.length)
  payload_bytes.set(iv)
  payload_bytes.set(encrypted_payload_bytes, iv.length)
  const payload_string = encode(payload_bytes)

  return payload_string
}