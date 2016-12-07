var load = new Promise( // returns 1 if there are any accounts, 0 if not  accounts.count() > 0
  function(resolve, reject){
    var _db;
    function loadHandler(){
      console.log('done loading');
      resolve(_db);
    }
    try{
      _db = new loki('bonsai-client.db', {
        autosave: true,
        autosaveInterval: 1500,
        autoload: true,
        autoloadCallback: loadHandler // heh
      });
    }
    catch(err) {
      console.log('error');
      reject();
    }
  }
);

module.exports = load.then(function(db){
  var accounts = db.getCollection('accounts');
  console.log("dingle");
  return {
    db: db,
    any: accounts ? accounts.count() > 0 : false
  }
});
