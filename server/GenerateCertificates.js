var nacl =require('tweetnacl');
var fs= require('fs')

var key = nacl.box.keyPair()
  , id = Buffer.from(key.publicKey)
    , pw = Buffer.from(key.secretKey);

console.log(fs.writeFileSync('Certificate.crt', pw));
console.log(fs.writeFileSync('ServerCertificate.crt', id));
