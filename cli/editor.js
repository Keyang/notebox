module.exports={
  edit:edit
}


var fs = require("fs");
var env = require("../env");
var log = require("../log");
var temp=require("temp");
var spawn=require("child_process").spawn;
var tty=require("tty");
temp.track();
function edit(data,cb){
  temp.open("update-note",function(err,info){
    if (err){
      cb(err);
    }else{
      log.debug(info);
      var fd=info.fd;
      var path=info.path;
      fs.writeSync(fd,data);
      runEditor(path,function(){
        var newData=fs.readFileSync(path,"utf8");
        cb(null,newData);
      });
    }
  });
}
function runEditor(path,cb){
  var editor=getEditor();
  var c=spawn(editor,[path],{
    stdio:[process.stdin,process.stdout,process.stderr]
  });
  c.on("close",function(){
    process.stdin.setRawMode(false);
    cb();
  });
  process.stdin.setRawMode(true);
}
function getEditor() {
  var cmd = env.get("EDITOR");
  if (fs.existsSync(cmd)){
    return cmd;
  }else{
    throw(new Error("Cannot find a valid editor. Please setup $EDITOR environtment variable."));
  }
}
