module.exports = function(data, options) {
  var Table = require('cli-table');
  var log = require("../log");
  var colNum=process.stdout.columns-10;
  if (isNaN(colNum) || colNum<0  ){
    colNum=100;
  }
  var colLen=[
    Math.round(1/12*colNum),
    Math.round(0.5*colNum),
    Math.round(1/6*colNum),
    Math.round(0.25*colNum)
  ];
  // instantiate
  var table = new Table({
    head: ["ID", "Data", "Tags", "Title"],
    colWidths:colLen
  });
  var async = require("async");
  var db = require("../db").get(options.db);
  var note = require("../core/note");
  log.debug("output",data);
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
      table.push([
        item.rowid,
        item.ispassword?"(encrypted)":item.isblob ? "(binary data)" : item.data ? item.data : "",
        item.tags ? item.tags : "",
        item.title ? item.title : ""
      ]);
      scb(null);
    });
  }, function(err) {
    if (err) {
      log.error(err);
    }
    console.log(table.toString());
  });
}
process.stdout.on('resize', function() {
  console.log('screen size has changed!');
  console.log(process.stdout.columns + 'x' + process.stdout.rows);
});
