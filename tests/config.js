var assert=require("assert");
var db=require("../db");
var fs=require("fs");
var dbFile="./testdb";
var c=require("../core/config");
describe("config module",function(){
  after(function(){
    fs.unlinkSync(dbFile);
  })
  it ("should load and set config",function(done){
    var d=db.get(dbFile);
    db.init(d,function(err){
      c.getConfig(d,function(err,cfg){
        assert(!err);
        assert(cfg.version != undefined);
        done();
      })
    })
  })
});
