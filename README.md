<p align="center">
  <img src="https://content.luca-kiebel.de/websites/nibyou.de/img/NIBYOU%20logo%20and%20claim%20-%20digital%20-%20big.png" alt="Nibyou Logo">
</p>

# Nibyou Public Key Server

This is a NodeJS/Cloudflare Worker implementation of a RSA-Public Key Service. 

Keys have to be sent along with a signature (read: public key encrypted with private key) and a JSON Web Token authenticating the user.

Getting keys just requires a users UUID, no authentication is required.

