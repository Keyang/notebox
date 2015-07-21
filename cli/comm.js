module.exports={
  initDb:initDb
}
function initDb(path,cb){
  var db = require("../db").get(path);
  require("../db").init(db,cb);
}
