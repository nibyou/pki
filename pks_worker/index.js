import { Router } from 'itty-router'
import jwt from 'jwt-simple'
import base64js from 'base64-js'

const router = Router()

/**
 * Get single public key from KV
 * @param {string} id UUID of the user to get the public key of
 * @returns {Promise<key>} The users public key
 */
const getKey = async id => KEYS.get(id, {type: "json"})


router.get("/getKey/:id", async ({params}) => {
  const {id} = params
  const key = await getKey(id)

  if(key===null) return apiResponse({message:`Key for UUID ${id} not found.`}, true, 404)

  return apiResponse({key})
})


/**
 * Create/Update public key entry
 * @param {string} id UUID of user to set the public key of
 * @param {object} payload Payload to set the public key to
 * @returns 
 */
const putKey = async (id, payload) => KEYS.put(id, JSON.stringify(payload))

router.post("/setKey", async req => {
  const {token, key, signature} = await req.json()
  
  console.log("jwtsecret", JWT_SECRET)

  let user = jwt.decode(token, JWT_SECRET)
  if(user==null || !user.id) return apiResponse({message: "Token not valid or user not logged in"}, true, 403)

  console.log("user",user)

  const puK = await publicKey(key)

  console.log("puk", puK)

  const encoder = new TextEncoder()

  const keyHash = await crypto.subtle.digest("SHA-256", encoder.encode(key))

  console.log("keyHash", keyHash)

  let valid = await crypto.subtle.verify({ "name": "RSASSA-PKCS1-v1_5" }, puK, encoder.encode(signature), keyHash)
  if(!valid) return apiResponse({message:"Supplied signature is not valid"}, true, 400)

  const payload = {id:user.id, key, signature}

  await putKey(user.id, payload)

  return apiResponse(payload)
})


router.options("*", (req) => apiResponse("")) // itty-router doesnt respond to options requests without this

router.all("*", req => {
  console.log("unknown route requested:",req.url)
  return apiResponse({message:"Route not found"}, true, 404)
});

addEventListener('fetch', e => {
  e.respondWith(router.handle(e.request))
})


/**
 * Send response to client
 * @param {object} data Data to be sent in response
 * @param {boolean} error Whether or not the client should receive an error
 * @param {number} status HTTP/1.1 status code of the response
 * @returns {Response} Response object to return to worker
 */
 function apiResponse(data, error=false, status=200) {
  return new Response(JSON.stringify({error, ...data}), {
    headers: { 
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS', 
      'Access-Control-Allow-Headers': 'content-type',
      'content-type': 'application/json;charset=UTF-8' 
    },
    status
  })
}

const RSA_OAEP = {
  name: 'RSA-OAEP',
  modulusLength: 2048,
  // 0x010001 = 65537 is a Fermat Prime and a popular choice for the public exponent.
  publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
  hash: { name: 'SHA-256' },
};

/**
* Generate CryptoKey object from public key string
* @param {string} key String representation of public key
* @returns {CryptoKey} The public key in it's container
*/
const publicKey = (key) => crypto.subtle.importKey("spki", base64js.toByteArray(key), RSA_OAEP, true, ["encrypt", "verify"])