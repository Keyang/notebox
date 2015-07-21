var cli = require("commander");
var async = require("async");
var inputData = "";
var note = require("../core/note");
var db = require("../db");
var log = require("../log");
cli
  .option("-d, --db [dbFile]", "The path to a database file. If omitted, it will use $HOME/.sn.")
  .option("--id <id>", "Search by note id")
  .option("-t, --tags <tags>", "Results should belong to the tags. Seperate by comma(,)")
  .option("--delete", "Remove all found notes.")
  .option("-o, --output <outputType>", "Output format. It could be: table(default), raw, csv. ")
  .option("-p, --password [password]", "Attempt to decrypt all data with password")
  .parse(process.argv);


var rl = require("readline-sync");
require("./comm").initDb(cli.db, function() {
  var d = db.get(cli.db);
  var output = "table";
  if (cli.output) {
    output = cli.output;
  }
  if (cli.delete) {
    output = "delete";
  }
  var pwd = "";
  if (cli.password) {
    if (cli.password === true) {
      pwd = rl.question("Please enter password: ", {
        hideEchoBack: true
      });
    } else {
      pwd = cli.password;
    }
  }
  try {
    var opFunc = require("./output-" + output);
    if (cli.id) { //search by id
      note.loadById(d, cli.id, function(err, res) {
        if (err) {
          log.error(err);
        } else {
          opFunc(prepareOutput([res]), cli);
        }
      });
    } else { //search by text
      var txt = cli.args[0];
      log.debug("Search text:" + txt, "tags: ", cli.tags);
      note.searchText(d, txt, cli.tags ? cli.tags.split(",") : [], function(err, res) {
        if (err) {
          log.error(err);
        } else {
          opFunc(prepareOutput(res), cli);
        }
      })
    }
  } catch (e) {
    log.error(e);
    log.error("Failed initialise output printer.");
  }

  var aes = require("../encryption/aes");

  function prepareOutput(arr) {
    var rtn = [];
    arr.forEach(function(item) {
      if (item.ispassword) {
        try {
          item.data = aes.decrypt(item.data, pwd);
          item.ispassword = false;
        } catch (e) {
          log.warn(e);
        }
      }
      rtn.push(item);
    });
    return rtn;
  }
});
