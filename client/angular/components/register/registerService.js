(function(){
  function registerService(db, $rootScope, $location){
    var _identity, _session, _username, _password;
    var _checkKey, _checkUser, _checkCallback;


    var check = function(username, scope){
      if (db.isAccount(username)) scope.usernameValid = false;
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
    }

    var register = function(user, password){
      _identity = nacl.sign.keyPair(); // Long term identity keypair
      _session = nacl.box.keyPair(); // Ephemeral keypair to hide metadata (used for this request only)
      _username = user;
      _password = password;
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
        console.log('Confirmed registration');
        cipher = crypto.createCipher('aes192', _password);
        var encrypted = new Buffer(cipher.update(_identity.secretKey));
        console.log(encrypted);
        encrypted = Buffer.concat([encrypted, new Buffer(cipher.final())]);
        console.log("Secret key");
        console.log(_identity.secretKey);
        console.log("Encrypted secret key");
        console.log(encrypted);
        db.addAccount(_username, encrypted);
        $rootScope.activeUser = {
          username: _username,
          identity: _identity.secretKey
        }
        $location.path('/home');
        console.log($location.path());
      }
    }

    return {
      register: register,
      check: check
    }
  }

  module.exports = ['db', '$rootScope', '$location', registerService];
}());
