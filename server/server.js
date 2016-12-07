var io = require('socket.io')();
var nacl = require('tweetnacl');
var fs = require('fs');
var b64 = require('js-base64').Base64;
var path = require('path');
var secret = new Uint8Array(fs.readFileSync(path.resolve(__dirname, 'Certificate.crt')));
var loki = require('lokijs');
var users;
var _db = new loki(path.resolve(__dirname, 'bonsai.db'), {
  autosave: true,
  autosaveInterval: 1500,
  autoload: true,
  autoloadCallback: loadHandler // heh
});
function loadHandler(){
  users = _db.getCollection('users') || _db.addCollection('users', {
    autoupdate: true
  });
}

// Helper functions

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

// Socket listeners

io.on('connection', function(socket){
  socket.emit('got','');
  console.log('Socket connection established');
  socket.on('available', function(requestCipher, cb){
    console.log('got availability request');
    var request = decryptCall(requestCipher);
    var username = Buffer.from(request).toString('utf8');
    console.log(username);
    if (users.find({username: username}).length !== 0){
      console.log('false');
      return cb(false);
    }
    cb(true);
    console.log(true);
  });
  socket.on('register', function(requestCipher, cb){
    console.log("Got register request.");
    /*
    SUPER DUPER IMPORTANT DO NOT FORGET THIS!!!!!!!!!!!1111!!!!
    TODO - Replace callback usage or make sure it's safe.
    Letting the server execute code on the client is retarded, I just wasn't
    sure how to reply to the client so I'm using this for development
    */
    // TODO - Better validation
    var request = decryptCall(requestCipher);
    if (!request){ // Indicates that decryption was not successful
      // TODO: Handle this better
      return cb({status: 'could not decrypt'});
    }
    // I just concatenated the byte arrays of these to save the code from some weird encoding logic since all the
    // items have to be made into a single byte array for encryption anyways
    var identity_key = request.slice(0,32);
    var signature = request.slice(32,96);
    var username = request.slice(96, request.length);
    var sigValid = nacl.sign.detached.verify(username, signature, identity_key);
    if (!sigValid){ // Indicates signature is not valid
      // TODO: More detailed response
      return cb({status: 'bad signature'});
    }
    username = Buffer.from(username).toString('utf8');
    if (users.find({username: username}).length !== 0){
      return cb({status: 'username taken'});
    }
    var newUser = {
      username: username,
      identity_key: identity_key,
      signature: signature
    }
    users.insert(newUser);
    return cb({status: 'success'});
  });
});
io.listen(3000);

function decryptCall(req){
  // Decrypts API Calls with server's identity key
  var cipher = Uint8Array.from(req.cipher.data);
  var c_sessionKey = Uint8Array.from(req.session_key.data);
  var nonce = Uint8Array.from(req.nonce.data);
  var data = Uint8Array.from(nacl.box.open(cipher, nonce, c_sessionKey, secret));
  return data;
}

console.log('Listening to port 3000');
