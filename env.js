module.exports={
  get:get,
  set:set
}


var dynamic={};
var def={
  db:home()+"/.sn",
  log:"error",
  EDITOR:"/usr/bin/vi"
};
function isDefined(d){
  return typeof d !="undefined";
}

function get(key){
  return isDefined(dynamic[key])?dynamic[key]:isDefined(process.env[key])?process.env[key]:def[key];
}

function set(key,val){
  dynamic[key]=val;
}
function home(){
  //TODO add windows support
  return process.env["HOME"];
}
