module.exports = {
  init: init,
  get: get
};
var sqlite = require("sqlite3");
var async = require("async");
var s_version = require("./schema/version.json").version;
var log = require("../log");
var config = require("../core/config");
var fs = require("fs");
/**
Init database
*/
function init(db, cb) {
  async.waterfall([
    function(scb) {
      config.getConfig(db,function(err,res){
        if (err) {
          log.warn("Loading config failed. error: %s", err);
          scb(null, -1);
        } else {
          if (typeof res.version !="undefined") {
            scb(null,res.version);
          } else {
            log.warn("No configuration entry found");
            scb(null, -1);
          }
        }
      });
    },
    function(ver, scb) {
      log.info("Current version is %s, target version is %s", ver, s_version);
      ver++;
      var scripts = [];
      while (ver <= s_version) {
        scripts.push(ver + ".sql");
        ver++;
      }
      async.eachSeries(scripts, function(item, sscb) {
        var path = __dirname + "/schema/" + item;
        log.info("Start to import: %s", path);
        var content = fs.readFileSync(path, "utf8");
        log.debug(content);
        db.exec(content, function(err) {
          if (err) {
            sscb(err); //error happens. This needs to stop
          } else {
            sscb();
          }
        });
      }, function(e) {
        if (e) {
          scb(e);
        } else {
          scb();
        }
      });
    }
  ], cb);
}
//return a db instance for target path
function get(path) {
  if (typeof path === "undefined") {
    path = require("../env").get("db");
  }
  log.debug("DB location:",path);
  return new sqlite.Database(path);
}
