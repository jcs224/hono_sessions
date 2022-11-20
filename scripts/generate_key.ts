import { encode } from 'https://deno.land/std@0.165.0/encoding/base64.ts'

const key = await crypto.subtle.generateKey(
  {
    name: 'AES-GCM',
    length: 128
  },
  true,
  [
    'encrypt',
    'decrypt',
  ]
)

const key_buffer = await crypto.subtle.exportKey('raw', key)

const key_string = encode(key_buffer)

console.log(key_string)