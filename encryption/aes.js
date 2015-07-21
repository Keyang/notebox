module.exports={
  encrypt:encrypt,
  decrypt:decrypt
}

var crypto=require("crypto");
var log=require("../log");
function encrypt(data,password){
  log.debug("start to encrypt.","data size",data.length,"data type:",typeof(data),"password:",password);
  var cipher=crypto.createCipher("aes256",password);
  var encoding=typeof data ==="string"? "utf8":"binary";
  var rtn="";
  rtn+=cipher.update(data,encoding,"binary");
  rtn+=cipher.final("binary");
  return new Buffer(rtn,"binary");
}

function decrypt(data,password,encoding){
  log.debug("start to decrypt.","data size",data.length,"password:",password);
  if (!encoding){
    encoding="binary";
  }
  var cipher=crypto.createDecipher("aes256",password);
  var rtn="";
  rtn+=cipher.update(data,"binary",encoding);
  rtn+=cipher.final(encoding);
  return new Buffer(rtn,encoding);
}
