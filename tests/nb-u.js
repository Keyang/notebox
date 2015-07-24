var assert = require("assert");
var db = require("../db");
var fs = require("fs");
var dbFile = __dirname + "/testdb";
var d;
var c = require("../core/config");
var note = require("../core/note");
var spawn = require("child_process").spawn;

describe("CLI: update note", function() {
  before(function(done) {
    d = db.get(dbFile);
    db.init(d, function(err) {
      done();
    });
  })
  after(function() {
    fs.unlinkSync(dbFile);
  });
  it("should update a note attributes", function(done) {
    cli(["n", "-d", dbFile, "-t", "tt,mm", "hello world"], function(buf) {
      cli(["u", "1","-d", dbFile, "-t", "ss,dd,mm", "--title", "hi notebox","--nodata"], function(buf) {
        var c = cli(["s", "-d", dbFile, "notebox"], function(data) {
          assert(data.indexOf("hello") > -1);
          assert(data.indexOf("tt") === -1);
          assert(data.indexOf("mm") > -1);
          assert(data.indexOf("dd") > -1);
          done();
        })
      })
    });
  });
});


function cli(args, cb) {
  var c = spawn(__dirname + "/../cli/nb.js",
    args);
  var buffer = "";
  var e="";
  c.stdout.on("data", function(d) {
    buffer += d.toString();
  });
  c.on("exit", function() {
    if (e){
      console.log(e);
    }
    cb(buffer);
  });
  c.stderr.on("data",function(d){
      e+=d.toString();
  })
  return c;
}
