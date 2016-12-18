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

    var getDefault = function(){
      var query = {'$and': [
        {
          'primaryAccount': true
        },
        {
          'autoLogin': true
        }]};
      return accounts.findOne(query);
    }

    var setDefault = function(_account, _identity){
      accounts.find({}).forEach(function(account){ // Disable autologin for all other users
        account.primaryAccount = false;
        account.autoLogin = false;
      })
      _account.primaryAccount = true;
      _account.autoLogin = true;
      _account.encryptedIdentity = _identity; // Save identity decrypted so user can autologin
      _db.saveDatabase();
    }

    function isAccount(username){
      // This only checks if there is a local account
      return accounts.find({username: username}).length !== 0;
    }

    function addAccount(username, identity, prekeys){
      console.log("Adding account to database: ", username);
      var newAccount = {
        username: username,
        encryptedIdentity: identity,
        preKeys: prekeys,
        primaryAccount: false,
        autoLogin: false,
        friends: []
      };
      // If there is no primary account set, this account will become the primary one
      if (accounts.findOne({primaryAccount: true}) === null){
        newAccount.primaryAccount = true;
      }
      accounts.insert(newAccount);
      _db.saveDatabase();
    }

    function getPrimary(){
      return accounts.findOne({primaryAccount: true}) || accounts.findOne({}); // TODO - Remove the null coalescing, this is only for development laziness.
    }                                                                          //                                         Has no functionality in product

    return {
      addAccount: addAccount,
      isAccount: isAccount,
      newRequest: newRequest,
      get anyAccounts(){return anyAccounts()},
      get primaryAccount(){
        return getPrimary();
      },
      accounts: accounts.find({}),
      getDefault: getDefault,
      setDefault: setDefault
    }
  }

  module.exports = ['_db', db];
}());
