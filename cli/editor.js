module.exports = {
  edit: edit
}


var fs = require("fs");
var env = require("../env");
var log = require("../log");
var temp = require("temp");
var spawn = require("child_process").spawn;
var tty = require("tty");

function edit(data, cb) {
  log.debug("edit data", data);
  var path = temp.path();
  log.debug("temp path",path);
  fs.writeFileSync(path, data.toString("utf8"));
  runEditor(path, function() {
    var newData = fs.readFileSync(path, "utf8");
    fs.unlinkSync(path);
    cb(null, newData);
  });
}

function runEditor(path, cb) {
  var editor = getEditor();
  log.debug("editor path:",editor);
  var c = spawn(editor, [path], {
    stdio: [process.stdin, process.stdout, process.stderr]
  });
  c.on("close", function() {
    process.stdin.setRawMode(false);
    cb();
  });
  process.stdin.setRawMode(true);
}

function getEditor() {
  var cmd = env.get("EDITOR");
  if (fs.existsSync(cmd)) {
    return cmd;
  } else {
    throw (new Error("Cannot find a valid editor. Please setup $EDITOR environtment variable."));
  }
}
