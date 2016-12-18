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
  socket.on('available', function(requestCipher){
    var request = decryptCall(requestCipher);
    var username = Buffer.from(request).toString('utf8');
    if (users.find({username: username}).length !== 0){
      socket.emit('check-result', null);
    }
    socket.emit('check-result', username);
  });
  socket.on('searchUser', function(term){
    socket.emit('searchUser-result', users.chain().find({'username': {'$contains': term}}).limit(10).data());
  });
  socket.on('chat', function(username){
    var user = users.findOne({'username': username});
    if (user === null){
      return socket.emit('chat-response', null);
    }
    if (user.preKeys === null){
      return socket.emit('chat-response', null);
    }
    console.log('sending prekey');
    var key = user.pre_keys.pop();
    var pre_key = {
      publicKey: buf(key.publicKey),
      signature: buf(key.signature)
    }
    return socket.emit('chat-response', {username: username, pre_key: pre_key, identity: buf(user.identity_key)});
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
    var request = decryptCall2(requestCipher);
    if (!request){ // Indicates that decryption was not successful
      // TODO: Handle this better
      return cb({status: 'could not decrypt'});
    }
    // I just concatenated the byte arrays of these to save the code from some weird encoding logic since all the
    // items have to be made into a single byte array for encryption anyways
    var identity_key = naclDecode(request.identity_key);
    var signature = naclDecode(request.signature);
    var username = naclDecode(request.username);
    var ispublic = request.signedPreKeys !== null;
    var signedPreKeys = request.signedPreKeys;
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
      identity_key: request.identity_key,
      signature: request.signature,
      pre_keys: signedPreKeys,
      public: ispublic
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

function decryptCall2(req){
  // Decrypts API Calls with server's identity key
  var cipher = Uint8Array.from(req.cipher);
  var c_sessionKey = Uint8Array.from(req.session_key);
  var nonce = Uint8Array.from(req.nonce);
  var data = Buffer.from(nacl.box.open(cipher, nonce, c_sessionKey, secret));
  data = JSON.parse(data);
  return data;
}

function naclEncode(obj){
  return Buffer.from(JSON.stringify(obj));
}
function naclDecode(s){
  return Uint8Array.from(Buffer.from(s));
}
function buf(o){
  return Buffer.from(o);
}
console.log('Listening to port 3000');
