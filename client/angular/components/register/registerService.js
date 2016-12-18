(function(){
  function registerService(db, $rootScope, $location){
    var _identity, _session, _username, _password;
    var _checkKey, _checkUser, _checkCallback;
    var _scope;
    var _preKeys = null;

    var check = function(username, scope){
      _scope = scope;
      if (db.isAccount(username)) scope.usernameValid = false;
      _checkUser = username;
      var req = db.newRequest(username, 'utf8');
      _checkKey = req.key;
      socket.emit('available', req.request);
    }
    socket.on('check-result', function(result){
      _scope.usernameValid = result;
      _scope.$apply();
    })
    var register = function(user, password, privacy){
      _identity = nacl.sign.keyPair(); // Long term identity keypair
      _session = nacl.box.keyPair(); // Ephemeral keypair to hide metadata (used for this request only)
      _username = user;
      _password = password;
      username = Buffer.from(user, 'utf8');
      var prekeys = [];
      var signedPreKeys = [];
      if (!privacy){ // If the account is public, meaning people can send messages to the user without first sending a friend request,
        var i;       // we will create several pre-keys that can be used to begin chat sessions and sign them to verify authenticity
        for(i=0;i<10;i++){
          var newKey = nacl.box.keyPair();
          var keySig = nacl.sign.detached(newKey.publicKey, _identity.secretKey);
          prekeys.push(newKey);
          signedPreKeys.push({
            publicKey: buf(newKey.publicKey),
            signature: buf(keySig)
          });
        }
      }
      _preKeys = prekeys;
      var signature = nacl.sign.detached(username, _identity.secretKey);
      var data = {
        identity_key: buf(_identity.publicKey),
        signature: buf(signature),
        username: username,
        signedPreKeys: signedPreKeys
      }
      data = Buffer.from(JSON.stringify(data));
      //var data = Buffer.concat([identity_key, signature, username]);
      var nonce = nacl.randomBytes(nacl.box.nonceLength); // Generate random nonce
      var encryptedData = nacl.box(data, nonce, pub_ServerID, _session.secretKey); // Encrypt public key for identity with ephemeral key.
      var request = {
        // Probably should obfuscate this in production
        cipher: buf(encryptedData),
        session_key: buf(_session.publicKey),
        nonce: buf(nonce)
      };
      console.log(buf(encryptedData))
      socket.emit('register', request, registerCallback);
      console.log("Sent registratison request");
    }

    var registerCallback = function(response){
      if (response.status === 'success'){
        console.log('Confirmed registration');
        cipher = crypto.createCipher('aes192', _password);
        var encrypted = new Buffer(cipher.update(_identity.secretKey));
        console.log(encrypted);
        encrypted = Buffer.concat([encrypted, new Buffer(cipher.final())]);
        console.log("Secret key");
        console.log(_identity.secretKey);
        console.log("Encrypted secret key");
        console.log(encrypted);
        db.addAccount(_username, encrypted, _preKeys);
        $rootScope.activeUser = {
          username: _username,
          identity: _identity.secretKey
        }
        _scope.changeView();
        //_scope.$apply();
      }
    }

    return {
      register: register,
      check: check
    }
  }

  module.exports = ['db', '$rootScope', '$location', registerService];
}());
