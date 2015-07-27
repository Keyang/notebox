module.exports = function(data, options) {
  var Table = require('cli-table2');
  var log = require("../log");
  var colNum = process.stdout.columns - 10;
  if (isNaN(colNum) || colNum < 0) {
    colNum = 100;
  }
  var colLen = [
    // Math.round(Math.max(1 / 18 * colNum, 3)),
    Math.round(18 / 18 * colNum)
  ];
  var cols = [ "Data"];
  // instantiate
  var params = {
    head: cols,
    colWidths: colLen,
    wordWrap:true
  }
  var color = require("colors");
  var table = new Table(params);
  var async = require("async");
  var db = require("../db").get(options.db);
  var note = require("../core/note");
  log.debug("output", data);
  async.eachSeries(data, function(item, scb) {
    var id = item.rowid;
    note.getTags(db, id, function(err, res) {
      if (err) {
        item.tags = err.toString();
      } else {
        if (res) {
          item.tags = res.join(",");
        }
      }
      var eol = require("os").EOL;
      var d = "ID:".gray.bold+" ";
      d+=item.rowid.toString().white.bold+eol;
      if (item.title) {
        d += "Title: ".gray.bold ;
        d += item.title + eol;
      }
      if (item.tags) {
        d += "Tags: ".gray.bold;
        d += item.tags + eol;
      }
      d += "Create Date: ".gray.bold;
      d += new Date(item.created).toISOString();
      d += eol+ "Note: "+ eol;
      d += item.ispassword ? "(encrypted)" : item.isblob ? "(binary data)" : item.data ? item.data.toString().trim().white.bold : ""
      var curD = [
        d
      ];
      table.push(curD);
      scb(null);
    });
  }, function(err) {
    if (err) {
      log.error(err);
    }
    console.log(table.toString());
  });
}
