module.exports={
  getConfig:getConfig,
  setConfig:setConfig
}

function getConfig(db,cb){
  db.get("SELECT * FROM config;",function(err,res){
    if (err){
      cb(err);
    }else{
      if (res){
        if (res.config){
          //TODO add error handling
          cb(null,JSON.parse(res.config));
        }else{
          cb(null,{});
        }
      }else{
        cb(null,{});
      }
    }
  })
}

function setConfig(cfg,db,cb){
  var cfgStr=JSON.stringify(cfg);
  db.run("UPDATE config SET config=?",[cfgStr],cb)
}
