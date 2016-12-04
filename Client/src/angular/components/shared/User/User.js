class User {
  constructor(username=null, Import=false) {
    if (Import){
      // Import keys
    }
    if (!username){ // Username defaults to null because imports won't need them
      throw new Exception();
    }

    var IdentityKey = nacl.sign.keyPair(); // Generate long term ECDH signature keypair using Curve 25519

    function signID(text){
      return nacl.sign(encoder.encode(text), IdentityKey.secretKey);
    }
    this.requestSignID = function(text){
      if (text){
        return signID(text);
      }
    }
  }
}
