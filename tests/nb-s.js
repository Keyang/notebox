var assert = require("assert");
var db = require("../db");
var fs = require("fs");
var dbFile = __dirname + "/testdb";
var d;
var c = require("../core/config");
var note = require("../core/note");
var spawn = require("child_process").spawn;

describe("CLI: search note", function() {
  before(function(done) {
    d = db.get(dbFile);
    db.init(d, function(err) {
      done();
    });
  })
  after(function() {
    fs.unlinkSync(dbFile);
  });
  it("should search by a text", function(done) {
    cli(["n", "-d", dbFile, "-t", "tt,mm", "hello world"], function(buf) {
      var c = cli(["s", "-d", dbFile, "hell"], function(data) {
        assert(data.indexOf("hello") > -1);
        assert(data.indexOf("tt") > -1);
        assert(data.indexOf("mm") > -1);
        done();
      })
    });
  });
  it("should not search binary content", function(done) {
    cli(["n", "-d", dbFile, "-t", "tagme,tagb", "-b", "third hello world"], function(buf) {
      cli(["s", "-d", dbFile, "third"], function(buf) {
        assert(buf.indexOf("binary") === -1);
        done();
      })
    })
  })
  it("should decrypt password protected data if pwd is correct", function(done) {
    cli(["n", "-d", dbFile, "-t", "tagme1,tagb", "-p", "pwd", "third1 hello world"], function(buf) {
      cli(["s", "-d", dbFile, "-t", "tagme1"], function(buf) {
        assert(buf.indexOf("third1 hello world") === -1);
        cli(["s", "-d", dbFile, "-t", "tagme1", "-p", "pwd"], function(buf) {
          assert(buf.indexOf("third1 hello world") > -1);
          done();
        })
      })
    })
  })
  it("should search by multiple tags", function(done) {
    cli(["n", "-d", dbFile, "-t", "tagxl,tagy", "third hello world"], function(buf) {
      cli(["s", "-d", dbFile, "-t", "tagxl,tagy"], function(buf) {
        assert(buf.indexOf("third hello world") != -1);
        cli(["s", "-d", dbFile, "-t", "tagxl,tagz"], function(buf) {
          assert(buf.indexOf("third hello world") == -1);
          done();
        })
      })
    })
  })
});

function cli(args, cb) {
  var c = spawn(__dirname + "/../cli/nb.js",
    args);
  var buffer = "";
  c.stdout.on("data", function(d) {
    buffer += d.toString();
  });
  c.on("exit", function() {
    cb(buffer);
  });
  return c;
}
