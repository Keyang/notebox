#!/usr/bin/env node

var cli = require("commander");
var ver = require("../package.json").version;
cli.version(ver)
cli.command("n [data]","Create a new note. If no data provided, it will load from stdin.");
cli.command("s [search_string]", "Search notes with specific text. It can remove found entries. See 'help s'");
cli.command("u <id>","Update a note. See more details with command 'help u'");
cli.command("sql <statement>")
.option("-d, --db [dbFile]", "The path to a database file. If omitted, it will use $HOME/.sn.")
.description("Run SQL statement directly in db.(Dangerous)")
.action(function(statement,options){
  var db=require("../db").get(options.db);
  db.all(statement,console.log.bind(console));
});
cli.parse(process.argv);
