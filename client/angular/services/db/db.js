'use strict';
(function(){
  var db = function(_db){
    console.log(_db);
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

    var accounts = _db.getCollection('accounts') || _db.addCollection('accounts', {autoupdate: true});

    var anyAccounts = function(){
      return accounts.count() > 0;
    }

    function isAccount(username){
      // This only checks if there is a local account
      return accounts.find({username: username}).length !== 0;
    }

    function addAccount(username, identity){
      console.log("Adding account to database: ", username);
      var newAccount = {
        username: username,
        identity: identity
      };
      accounts.insert(newAccount);
      _db.saveDatabase();
      console.log(accounts.count());
      console.log(_db.getCollection('accounts').count());
    }

    return {
      addAccount: addAccount,
      isAccount: isAccount,
      newRequest: newRequest,
      get anyAccounts(){return anyAccounts()},
      get primaryAccount(){
        return accounts.findOne({username: 'dinglee'}) || accounts.findOne({});
      },
      accounts: accounts.find({})
    }
  }

  module.exports = ['_db', db];
}());
