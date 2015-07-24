var assert = require("assert");
var db = require("../db");
var fs = require("fs");
var dbFile = __dirname + "/testdb";
var d;
var c = require("../core/config");
var note = require("../core/note");
var spawn = require("child_process").spawn;
describe("CLI: New note", function() {
  before(function(done) {
    d = db.get(dbFile);
    db.init(d, function(err) {
      done();
    });
  })
  after(function() {
    fs.unlinkSync(dbFile);
  });
  it('should create new note', function(done) {
    cli(["n", "-d", dbFile, "-t", "taga,tagb", "hello world"], function() {
      note.searchText(d, "hello", function(err, notes) {
        assert(!err);
        assert(notes.length === 1);
        assert(notes[0].data === "hello world");
        done();
      })
    });
  });

  it("should create new note from stream", function(done) {
    var c = cli(["n", "-d", dbFile, "-t", "taga,tagb"], function() {
      note.searchText(d, "another", function(err, notes) {
        // console.log(notes);
        assert(!err);
        assert(notes.length === 1);
        assert(notes[0].data.toString() === "another hello world");
        done();
      })
    });
    c.stdin.write("another hello world");
    c.stdin.end();
  });

  it ("should accept binary",function(done){
    cli(["n", "-d", dbFile, "-t", "tagme,tagb","-b", "third hello world"], function(buf) {
      cli(["s","-d",dbFile,"-t","tagme"],function(buf){
        assert(buf.indexOf("binary")>-1);
        done();
      })
    })
  })
  it ("should protect data with password",function(done){
    cli(["n", "-d", dbFile, "-t", "tagme1,tagb","-p","mypwd", "third hello world"], function(buf) {
      cli(["s","-d",dbFile,"-t","tagme1"],function(buf){
        assert(buf.indexOf("encrypted")>-1);
        done();
      })
    })
  })
})



function cli(args, cb) {
  var c = spawn(__dirname + "/../cli/nb.js",
    args);
  var buffer="";
  c.stdout.on("data",function(d){
    buffer+=d.toString();
  });
  c.on("error",function(){
    throw(arguments);
  })
  c.on("exit", function(){
    cb(buffer);
  });
  return c;
}
