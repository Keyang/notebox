var cli = require("commander");
var async = require("async");
var inputData = "";
var note = require("../core/note");
var db = require("../db");
var log = require("../log");
cli
  .option("-d, --db [dbFile]", "The path to a database file. If omitted, it will use $HOME/.sn.")
  .option("-t, --tags <tags...>", "Tags associated with the data. Seperated by comma (,)")
  .option("-b, --binary", "Flag. Use it if input data is binary.")
  .option("-p, --password [password]", "The note will be protected by a password")
  .option("--title <title>", "The title of the note.")
  .parse(process.argv);

var d = db.get(cli.db);
var rl = require("readline-sync");
var params = {};
var pwd = "";
var W = require("stream").Writable;
log.debug(cli.args, process.stdin.isTTY);
async.series([
  function(scb) {
    log.debug("init db");
    require("./comm").initDb(cli.db, scb);
  },
  function(scb) {
    if (cli.args.length > 0) {
      inputData = cli.args[0];
      scb();
    } else {
      if (!process.stdin.isTTY) {
        log.debug("PIPE mode for stdio.");
        var bufferArr = [];
        process.stdin.resume();
        process.stdin.on("data", function(b, e) {
          // if (cli.binary) {
          //   bufferArr.push(b);
          // } else {
          //   bufferArr.push(b.toString());
          // }
          bufferArr.push(b);
        });
        process.stdin.on("end", function() {
          // if (cli.binary) {
          //   inputData = Buffer.concat(bufferArr);
          // } else {
          //   inputData = bufferArr.join("");
          // }
          inputData = Buffer.concat(bufferArr);
          scb();
        });
        process.stdin.on("error", function(e) {
          scb(e);
        });
      }else{
        var editor=require("./editor");
        editor.edit("",function(err,d){
          if (!d){
              scb(new Error("User aborted."));
          }else{
            inputData=d;
            scb(err);
          }
        });
      }
    }
  },
  function(scb) { //check pwd
    if (cli.password) {
      if (cli.password === true) {
        pwd = rl.question("Please enter password: ", {
          hideEchoBack: true
        });
        scb();
      } else {
        pwd = cli.password;
        scb();
      }
    } else {
      scb();
    }

  },
  function(scb) {
    if (pwd) {
      var aes = require("../encryption/aes");
      inputData = aes.encrypt(inputData, pwd);
      params.ispassword = 1;
    }
    scb();
  },
  function(scb) {
    params.data = inputData
    if (cli.binary) {
      params.isblob = 1;
    }
    if (cli.title) {
      params.title = cli.title
    }
    var tags = cli.tags;
    async.waterfall([
      function(sscb) {
        log.debug(params);
        note.new(d, params, sscb);
      },
      function(id, sscb) {
        console.log("ID: ", id);
        if (tags) {
          note.addTags(d, id, tags.split(","), sscb);
        } else {
          sscb();
        }
      }
    ], scb);
  }
], function(err) {
  if (err) {
    console.log(err);
  }
});
