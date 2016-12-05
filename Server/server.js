var io = require('socket.io')();
var nacl = require('tweetnacl');
var fs = require('fs');
var b64 = require('js-base64').Base64;
var path = require('path');
var secret = new Uint8Array(fs.readFileSync(path.resolve(__dirname, 'Certificate.crt')));
var Datastore = require('nedb')
  , db = new Datastore({ filename: 'db', autoload: true });

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
  socket.emit('got it');
  console.log('Socket connection established');
  socket.on('register', function(requestCipher, cb){
    // TODO - Better validation
    var request = decryptCall(requestCipher);
    if (!request){ // Indicates that decryption was not successful
      // TODO: Handle this better
      cb({status: 'could not decrypt'});
      return;
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
    db.findOne({username: username}, function(err, doc){
      if (err){
        return cb({status: 'try again later'});
      } else if(doc !== null){
        return cb({status: 'username taken'});
      } else {
        var userBinding = {
          username: username,
          identity_key: identity_key,
          signature: signature
        }
        db.insert(userBinding, function(err, newDoc){
          if (err){
            return cb({status: 'try again later'})
          }
          return cb({status: 'success', id: newDoc._id});
        });
      }
    });
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
