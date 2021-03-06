import { NowRequest, NowResponse } from '@vercel/node'
import nacl from 'tweetnacl'

const keys: { [iss: string]: string } = {
  automatron: 'bmIKq9BRnKLBzUl1jnxeI1+DWvIEauyrSvuywrUjKrU=',
}

export default async function (req: NowRequest, res: NowResponse) {
  try {
    const iss = String(req.query.i)
    if (!{}.hasOwnProperty.call(keys, iss)) {
      res.status(400).send('unknown issuer')
      return
    }
    const key = Buffer.from(keys[iss], 'base64')
    const url = String(req.query.u)
    const prefixLength = +req.query.p
    const message = Buffer.from(prefixLength ? url.slice(0, prefixLength) + '*' : url)
    const sig = Buffer.from(String(req.query.s), 'base64')
    console.log(key, message, sig)
    const verified = nacl.sign.detached.verify(message, sig, key)
    if (!verified) {
      res.status(400).send('invalid signature')
      return
    }
    res.redirect(url)
  } catch (error) {
    console.error(error)
    res.status(500).send('something is off')
  }
}