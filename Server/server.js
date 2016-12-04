// Imports

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var nacl = require('tweetnacl');
var b64 = require('js-base64').Base64;
var fs = require('fs');
var secret = fs.readFileSync('Certificate.crt');
var pvt_Identity = nacl.box.keyPair.fromSecretKey(secret);

// Helper functions

var ips = {};

var Datastore = require('nedb')
  , db = new Datastore({ filename: 'db', autoload: true });

// js doesn't have string formatting by default
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

function getUser(username){
  db.findOne({"username": username}, function(err, doc){
    if (err){
      throw new Exception("Error retrieving user from database");
    }
    return doc;
  })
}


// Server

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

router.get('/', function(req, res) {
  res.json({message: "Welcome!"});
});

router.get('/available', function(req, res) {
  var cipher = req.body.cipher;

  res.json({available: true});
});

router.post('/register', function(req, res) {
  console.log("Got register request");
  var cipher = new Uint8Array(new Buffer(b64.decode(req.body.cipher)).toString().split(','));
  var c_sessionKey = new Uint8Array(new Buffer(b64.decode(req.body.session_key)).toString().split(','));
  var nonce = new Uint8Array(new Buffer(b64.decode(req.body.nonce)).toString().split(','));
  var data = nacl.box.open(cipher, nonce, c_sessionKey, secret);
  console.log("Trying to decrypt box");
  if (!data){
    res.send(400); // Tell client to fuck off with shitty requests
  }
  console.log("Got register request");
  // data is b64 encoded json string
  data = JSON.parse(b64.decode(new Buffer(data)));
  var signature = new Uint8Array(new Buffer(b64.decode(data.signature)).toString().split(','));
  console.log("Username signature: ",b64.decode(data.signature))
  var identity_key = new Uint8Array(new Buffer(b64.decode(data.identity_key)).toString().split(','));
  var username = data.username;
  var sigValid = nacl.sign.open(signature, identity_key);
  var b_user = new Uint8Array(data.username);
  if (sigValid !== data.username){
    res.send(400); // tell client to fuck off
  }
  if (getUser(username)){
    res.send(409);
  }
  db.insert({
    username: username,
    identity_key: identity_key,
    signature: signature
  });
  console.log(username);
  res.json('success');
});

app.use('/api', router);

app.listen(port);


console.log('Doing baller shit on port {0}'.format(port));
