module.exports={
  addTags:addTags,
  getTags:getTags,
  rmTags:rmTags,
  rmAllTags:rmAllTags
}
var async=require("async");
var log = require("../log");
function addTags(db, id, tagArr, cb) {
  async.each(tagArr,function(item,scb){
    var tId=null;
    async.waterfall([
      function(sscb){ // find specific tag
        db.get("SELECT rowid,* FROM tag WHERE name=?",[item],sscb);
      },
      function(tag,sscb){ // check existence of tag
        if (sscb){ //if existed, return tagid
          sscb(null,tag.rowid);
        }else{//other wise, insert the tag first and return inserted id
          sscb=tag;
          db.run("INSERT INTO tag (name) VALUES (?)",[item],function(err){
            if (err){
              sscb(err);
            }else{
              sscb(null,this.lastID);
            }
          });
        }
      },
      function(tagId,sscb){//find specific tag-note relationship
        tId=tagId;
        db.get("SELECT * FROM note_tag WHERE note_id=? AND tag_id=?",id,tagId,sscb);
      },
      function(re,sscb){//check relationship existed
        if (sscb){//if existed, do nothing
          sscb();
        }else{//otherwise insert relationship
          sscb=re;
          db.run("INSERT INTO note_tag (note_id,tag_id) VALUES (?,?)",id,tId,sscb);
        }
      }
    ],scb);
  },cb);
}

function getTags(db, id, cb) {
  db.all("SELECT tag.name FROM tag LEFT JOIN note_tag ON note_tag.note_id == ? WHERE tag.rowid == note_tag.tag_id",id,function(err,res){
    if (err){
      cb(err);
    }else{
      if (res){
        var rtn=[];
        res.forEach(function(item){
          rtn.push(item.name);
        });
        cb(null,rtn);
      }else{
        cb(null,[]);
      }
    }
  });
}
function rmTags(db,id,tagArr,cb){
  async.each(tagArr,function(item,scb){
    async.waterfall([
      function(sscb){
        db.get("SELECT rowid,* FROM tag WHERE name =?",[item],sscb);
      },
      function(tag,sscb){
        if (sscb){
          db.run("DELETE FROM note_tag WHERE note_id=? AND tag_id=?",[id,tag.rowid],sscb);
        }else{
          sscb=tag;
          sscb();
        }
      }
    ],scb);
  },cb);
}
function rmAllTags(db,id,cb){
  db.run("DELETE FROM note_tag WHERE note_id=?",[id],cb);
}
