var cli = require("commander");
var async = require("async");
var inputData = "";
var note = require("../core/note");
var db = require("../db");
var log = require("../log");
var aes = require("../encryption/aes");
var rl = require("readline-sync");
cli
  .option("-d, --db [dbFile]", "The path to a database file. If omitted, it will use $HOME/.sn.")
  .option("-t, --tags <tags...>", "Tags associated with the data. Seperated by comma (,)")
  .option("-b, --binary <true/false>", "Flag. Indicate if content is binary.")
  .option("-p, --password [password]", "Update the password. To remove existing password, leave it empty.")
  .option("--title <title>", "The title of the note.")
  .option("--nodata", "Skip editing content")
  .parse(process.argv);
require("./comm").initDb(cli.db, function() {
  var id = cli.args[0];
  if (typeof id === "undefined") {
    console.error("Need <id> parameter for updating.");
    process.exit();
  }
  log.debug(id, cli.binary, cli.tags, cli.title, cli.data, cli.password);
  var data = {};
  var d = db.get(cli.db);
  var editor = require("./editor");
  async.series([
    function(scb) { // if edit data
      if (!!!cli.nodata) {
        var curPwd, newPwd, curNote;
        async.waterfall([
          function(sscb) { //load note
            note.loadById(d, id, sscb);
          },
          function(res, sscb) { //decrypt data if password protected
            curNote = res;
            if (res.ispassword) {
              var pwd = rl.question("Please enter password: ", {
                hideEchoBack: true
              });
              try {
                res.data = aes.decrypt(res.data, pwd);
                curPwd = pwd;
                sscb(null, res);
              } catch (e) {
                log.error(e);
                sscb(new Error("Password incorrect"));
              }
            } else {
              sscb(null, res);
            }
          },
          function(res, sscb) { //edit the data
            editor.edit(res.data, sscb);
          },
          function(newNote, sscb) { //encrypt new note accordingly
            if (cli.password) {
              if (cli.password === true) {
                newPwd = rl.question("Please enter new password: ", {
                  hideEchoBack: true
                });
              } else {
                newPwd = cli.password;
              }
              if (newPwd === "" && curPwd) {
                log.debug("remove password", newPwd, curPwd);
                data.ispassword = 0;
              } else {
                log.debug("encrypt new note with new password", newPwd);
                newNote = aes.encrypt(newNote, newPwd);
                data.ispassword = 1;
              }
            } else {
              if (curPwd) {
                log.debug("encrypt new note with old password", curPwd);
                newNote = aes.encrypt(newNote, curPwd);
                data.ispassword = 1;
              }
            }
            sscb(null, newNote);
          },
          function(newData, sscb) {
            if (curNote.data === newData) {
              log.debug("data not changed.");
              delete data.data;
            } else {
              log.debug("data has changed.");
              data.data = newData;
            }
            sscb();
          }
        ], scb);
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
      var keys=[];
      for (var key in data){
        keys.push(key);
      }
      if (keys.length>0){
        note.update(d, id, data, scb);
      }else{
        log.debug("note meta data not changed.")
        scb();
      }
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
