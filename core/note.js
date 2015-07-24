module.exports = {
  new: newFromData,
  loadById: loadById,
  getTags: getTags,
  addTags: addTags,
  searchText: searchText,
  rmTags: rmTags,
  rmNote: rmNote,
  update: update,
  rmAllTags:rmAllTags

}
var log = require("../log");
var tag = require("./tag");
var async = require("async");
var tagSep = ",";
//create a new note from a string
//param is json object same structure of note.
function newFromData(db, param, cb) {
  applyDefault(param);
  var keys = [];
  var holder = [];
  var vals = [];
  for (var key in param) {
    keys.push(key);
    vals.push(param[key]);
    holder.push("?");
  }
  var sql = "INSERT INTO note (" + keys.join(", ") + ") VALUES (" + holder.join(", ") + ")";
  log.debug(sql, vals);
  db.run(sql, vals, function(err) {
    if (err) {
      log.error(err);
      cb(err);
    } else {
      cb(null, this.lastID);
    }
  });
}

function loadById(db, id, cb) {
  db.get("SELECT rowid,* FROM note WHERE rowid=?", [id], function(err, res) {
    if (err) {
      log.error(err);
      cb(err);
    } else {
      if (!res) {
        cb(new Error("Not Found!"));
      } else {
        cb(null, res);
      }
    }
  });
}

function applyDefault(param) {
  param.created = Date.now();
}

function getTags(db, id, cb) {
  tag.getTags(db, id, cb);
}

function addTags(db, id, tagArr, cb) {
  tag.addTags(db, id, tagArr, cb);
}

function genQues(num) {
  var rtn = [];
  for (var i = 0; i < num; i++) {
    rtn.push("?");
  }
  return rtn;
}

function searchText(db, txt, tags, cb, limit) {
  var rtn = [];
  if (typeof cb === "undefined") {
    cb = tags;
    tags = [];
  }
  if (!tags) {
    tags = [];
  }
  if (!txt) {
    txt = "";
  }
  var limitLen=512;
  var sql = "SELECT note.rowid, note.ispassword, note.created,note.isblob,note.title, ";
  if (limit){
    sql+=" case when isblob is 1 then ''"
    sql+=" when length(note.data)>"+limitLen+" "+
    "then substr(note.data,0,"+limitLen+") || '"+require("os").EOL+"(more...)' else "+
    "note.data end as data "
  }else{
    sql+="note.data "
  }
  sql+=" FROM note " +
    "WHERE 1=1 "
  if (txt) {
    sql += " AND ((note.isblob is not 1 AND " +
      "note.ispassword is not 1 AND " +
      "note.data LIKE '%" + txt + "%'" +
      ") OR title LIKE '%" + txt + "%')";
  }
  log.debug(sql);
  if (tags.length > 0) {
    async.waterfall([
      function(scb) {
        var ques = [];
        for (var i = 0; i < tags.length; i++) {
          ques.push("?");
        }
        var sqlTagIds = "SELECT rowid FROM tag WHERE name IN (" + ques.join(",") + ")";
        log.debug("sqlTagIds", sqlTagIds, tags);
        db.all(sqlTagIds, tags, scb);
      },
      function(res, scb) {
        log.debug("tagids", res);
        if (res.length < tags.length) {
          scb(null, []);
          return;
        }
        var noteIds = [];
        async.eachSeries(res, function(item, sscb) {
          var ques = genQues(noteIds.length);
          var sqlNoteTag = "SELECT note_tag.note_id FROM note_tag WHERE tag_id = ? ";
          if (ques.length > 0) {
            sqlNoteTag += "AND note_id IN (" + ques.join(",") + ")";
          }
          db.all(sqlNoteTag, [item.rowid].concat(noteIds), function(err, r) {
            if (err) {
              sscb(err);
            } else {
              noteIds = [];
              if (r) {
                r.forEach(function(it) {
                  if (noteIds.indexOf(it.note_id) === -1) {
                    noteIds.push(it.note_id);
                  }
                });
              }
              sscb(null);
            }
          });
        }, function(err) {
          if (err) {
            scb(err);
          } else {
            log.debug("Found notes", noteIds);
            scb(null, noteIds);
          }
        });
      },
      function(noteIds, scb) {
        log.debug("noteIds", noteIds);
        var ques = genQues(noteIds.length);
        if (ques.length === 0) { //no matching tag array
          scb(null, []);
        } else {
          sql += " AND note.rowid in (" + ques.join(",") + ")"
          log.debug(sql);
          db.all(sql, noteIds, scb);
        }
      }
    ], cb);
  } else {
    db.all(sql, tags, cb);
  }

  // function procRes(scb) {
  //   return function(err, res) {
  //     if (err) {
  //       scb(err);
  //     } else {
  //       if (res) {
  //         concatRes(res);
  //       }
  //       scb();
  //     }
  //   }
  // }
  //
  // function concatRes(resArr) {
  //   resArr.forEach(function(item) {
  //     for (var i = 0; i < rtn.length; i++) {
  //       if (rtn[i].rowid == item.rowid) {
  //         return;
  //       }
  //     }
  //     rtn.push(item);
  //   });
  // }
  // async.series([
  //   function(scb) {
  //     var sql = "SELECT note.rowid, note.* FROM note " +
  //       "WHERE ((" +
  //       "note.isblob is not 1 AND " +
  //       "note.ispassword is not 1 AND " +
  //       "note.data LIKE '%" + txt + "%'" +
  //       ") OR title LIKE '%" + txt + "%') AND " +
  //       "note.rowid in (SELECTE note_tag.note_id FROM note_tag " +
  //       "LEFT JOIN tag ON tag.rowid == note_tag.tag_id " +
  //       "WHERE tag.name in (?)"
  //     db.all(sql, tags, procRes(scb));
  //   },
  //   function(scb) {
  //     var sql = "SELECT DISTINCT note.rowid, note.* FROM tag " +
  //       "LEFT JOIN note_tag ON note_tag.tag_id == tag.rowid " +
  //       "LEFT JOIN note ON note_tag.note_id == note.rowid " +
  //       "WHERE tag.name LIKE '%" + txt + "%'";
  //     db.all(sql, procRes(scb));
  //   }
  // ], function(err) {
  //   if (err) {
  //     cb(err);
  //   } else {
  //     cb(null, rtn);
  //   }
  // });

  // var sql="SELECT DISTINCT note.rowid, note.* FROM note_tag "+
  //  "LEFT JOIN tag ON note_tag.tag_id == tag.rowid "+
  //  "LEFT JOIN note ON note_tag.note_id == note.rowid "+
  //  "WHERE (note.isblob is not 1 AND note.data LIKE '%"+txt+"%') OR tag.name LIKE '%"+txt+"%' OR title LIKE '%"+txt+"%'"
  // log.debug(sql);
  // db.all(sql,cb);
}

function rmTags(db, id, tagArr, cb) {
  tag.rmTags(db, id, tagArr, cb);
}

function rmAllTags(db, id,  cb) {
  tag.rmAllTags(db, id, cb);
}

function rmNote(db, id, cb) {
  async.series([
    function(scb) { //remove tags
      tag.rmAllTags(db, id, scb);
    },
    function(scb) { //remove note
      db.run("DELETE FROM note WHERE rowid=?", [id], scb);
    }
  ], cb);
}

function update(db, id, newD, cb) {
  var key = "";
  var val = [];
  for (var k in newD) {
    val.push(newD[k]);
    if (key) {
      k = "," + k;
    }
    key += k + "=?";
  }
  var sql = "UPDATE note " +
    "SET " + key +
    " WHERE rowid=? ";
  log.debug(sql);
  db.run(sql, val.concat([id]), cb);
}
