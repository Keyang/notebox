var w = require("winston");
var env=require("./env");
var logger = new(w.Logger)({
  transports: [
    new(w.transports.Console)({
      // "level": "info"
      "level": env.get("log")
    })
  ]
});
module.exports = logger;
