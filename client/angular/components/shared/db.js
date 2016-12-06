(function(){
  var loki = require('lokijs');
  var db = function(){
    var _db = new loki('bonsai.db');
    var accounts = _db.getCollection('accounts') || _db.addCollection('accounts');

    function newRequest(message, encoding=null){
      var requestKey = nacl.box.keyPair();
      var nonce = nacl.randomBytes(nacl.box.nonceLength);
      message = Buffer.from(message, encoding);
      var data = nacl.box(message, nonce, pub_ServerID, requestKey.secretKey);
      return ({
        key: requestKey.secretKey,
        request: {
          cipher: Buffer.from(data),
          nonce: Buffer.from(nonce),
          session_key: Buffer.from(requestKey.publicKey)
        }
      });
    }

    function isAccount(username){
      // This only checks if there is a local account
      if (accounts.find({username: username}).length !== 0){
        return true;
      }
    }

    function addAccount(username, identity){
      console.log("Adding account to database: ", username);
      accounts.insert({
        username: username,
        identity: identity
      });
    }

    return {
      addAccount: addAccount,
      isAccount: isAccount,
      newRequest: newRequest
    }
  }

  module.exports = db;
}());
