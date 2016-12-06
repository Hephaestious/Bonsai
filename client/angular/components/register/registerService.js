(function(){
  function registerService(db){
    var _identity, _session, _username;
    var _checkKey, _checkUser, _checkCallback;
    var check = function(username, scope){
      console.log('checking');
      //if (db.isAccount(username)) $scope.usernameValid = false;
      _checkUser = username;
      var req = db.newRequest(username, 'utf8');
      _checkKey = req.key;
      // TODO - Find a better way to link responses and requests
      var checkCallback = function(data){
        console.log((data ? "" : "not "), "available");
        scope.usernameValid = data;
        scope.$apply();
      }
      socket.emit('available', req.request, checkCallback);
      console.log("Sent username availability check for:"+username);
    }

    var register = function(user){
      _identity = nacl.sign.keyPair(); // Long term identity keypair
      _session = nacl.box.keyPair(); // Ephemeral keypair to hide metadata (used for this request only)
      _username = user;
      username = Buffer.from(user, 'utf8');
      var signature = Buffer.from(nacl.sign.detached(username, _identity.secretKey));
      var identity_key = Buffer.from(_identity.publicKey);
      var data = Buffer.concat([identity_key, signature, username]);
      var nonce = nacl.randomBytes(nacl.box.nonceLength); // Generate random nonce
      var encryptedData = nacl.box(data, nonce, pub_ServerID, _session.secretKey); // Encrypt public key for identity with ephemeral key.
      var request = {
        // Probably should obfuscate this in production
        cipher: Buffer.from(encryptedData),
        session_key: Buffer.from(_session.publicKey),
        nonce: Buffer.from(nonce)
      };
      socket.emit('register', request, registerCallback);
      console.log("Sent registratison request");
    }
    var registerCallback = function(response){
      if (response.status === 'success'){
        console.log('registered');
        db.addAccount(_username, _identity);
      }
    }
    return {
      register: register,
      check: check
    }
  }

  module.exports = ['db', registerService];
}());
