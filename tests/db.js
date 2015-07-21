var assert=require("assert");
var db=require("../db");
var fs=require("fs");
var dbFile="./testdb";
describe("db module",function(){
  after(function(){
    fs.unlinkSync(dbFile);
  })
  it ("should init files",function(done){
    var d=db.get(dbFile);
    db.init(d,function(err){
      assert(!err);
      d.all("select * from SQLITE_MASTER;",function(err,res){
        assert(!err);
        assert(res.length>0);
        done();
      })
    })
  })
});
