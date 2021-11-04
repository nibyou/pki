<p align="center">
  <img src="https://content.luca-kiebel.de/websites/nibyou.de/img/NIBYOU%20logo%20and%20claim%20-%20digital%20-%20big.png" alt="Nibyou Logo">
</p>

# Nibyou Public Key Server

This is a NodeJS/Cloudflare Worker implementation of an RSA-Public Key Service. 

Keys have to be sent along with a signature (read: public key encrypted with private key) and a JSON Web Token authenticating the user.

Getting keys just requires a users UUID, no authentication is required.

## API Documentation

### GET /getKey/:uuid

Returns the public key of the user with the given UUID.<br />
Returns a 404 if the user does not exist.

### POST /setKey

Parameters (body): 
 - token: JSON Web Token authenticating the user
 - key: public key of the user

Returns the payload if the key was successfully set.<br />
Returns a 403 if the user already has a key.<br />

Explanation of the parameter acquisition:
 - token: acquired from the nibyou/auth API
 - key: public part of a generated RSA-PSS keypair (in SPKI format):
 
```javascript
const {publicKey, privateKey} = await crypto.subtle.generateKey({
    name: 'RSA-PSS',
    modulusLength: 2048,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    hash:'SHA-256',
},true,["verify","sign"])

const exportPuK = btoa(await crypto.subtle.exportKey("spki",publicKey))
```