var cli = require("commander");
var async = require("async");
var inputData = "";
var note = require("../core/note");
var db = require("../db");
var log = require("../log");
cli
  .option("-d, --db [dbFile]", "The path to a database file. If omitted, it will use $HOME/.sn.")
  .option("-t, --tags <tags...>", "Tags associated with the data. Seperated by comma (,)")
  .option("-b, --binary <true/false>", "Flag. Indicate if content is binary.")
  .option("--title <title>", "The title of the note.")
  .option("--data", "Edit the data")
  .parse(process.argv);
require("./comm").initDb(cli.db, function() {
  var id = cli.args[0];
  if (typeof id === "undefined") {
    console.error("Need <id> parameter for updating.");
    process.exit();
  }
  log.debug(id, cli.binary, cli.tags, cli.title, cli.data);
  var data = {};
  var d = db.get(cli.db);
  var editor = require("./editor");
  async.series([
    function(scb) { // if edit data
      if (cli.data) {
        note.loadById(d, id, function(err, res) {
          if (err) {
            scb(err);
          } else {
            var oldData = res.data;
            editor.edit(oldData, function(err, newData) {
              if (err) {
                scb(err);
              } else {
                data.data = newData;
                scb();
              }
            });
          }
        });
      } else {
        scb();
      }
    },
    function(scb) {
      if (cli.title) {
        data.title = cli.title;
      }
      if (cli.binary && cli.binary === "true") {
        data.isblob = 1;
      }
      note.update(d, id, data, scb);
    },
    function(scb) {
      if (cli.tags) {
        async.series([
          function(sscb) {
            note.rmAllTags(d, id, sscb);
          },
          function(sscb) {
            note.addTags(d, id, cli.tags.split(","), sscb);
          }
        ], scb);
      } else {
        scb();
      }
    }
  ], function(err) {
    if (err) {
      log.error(err);
    } else {
      console.log("Updated successfully");
    }
  });
});
