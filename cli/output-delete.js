module.exports=function(data,options){
  var async=require("async");
  var log=require("../log");
  var db=require("../db").get(options.db);
  var note=require("../core/note");
  async.each(data,function(item,scb){
    note.rmNote(db,item.rowid,scb);
  },function(err){
    if (err){
      log.error(err);
    }else{
      console.log("Operation finished successfully.");
    }
  });
}
