var assert=require("assert");
var aes=require("../encryption/aes.js");

describe("aes",function(){
  it ("should encrypt and decrypt text",function(){
    var data="hello world";
    var pwd="jfeklbvnalek2";
    var b=aes.encrypt(data,pwd);
    assert(b);
    assert(b.length);
    var d=aes.decrypt(b,pwd);
    assert(d.toString() ===data);
  });
  it ("should encrypt and decrypt buffer",function(){
    var data=new Buffer("hello world");
    var pwd="jfeklbvnalek2";
    var b=aes.encrypt(data,pwd);
    assert(b);
    assert(b.length);
    var d=aes.decrypt(b,pwd);
    assert(d.toString() ===data.toString());
  });
})
