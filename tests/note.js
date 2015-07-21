var assert = require("assert");
var db = require("../db");
var fs = require("fs");
var dbFile = "./testdb";
var d;
var c = require("../core/config");
var note = require("../core/note");
describe("note module", function() {
  before(function(done) {
    d = db.get(dbFile);
    db.init(d, function(err) {
      done();
    });
  })
  after(function() {
    fs.unlinkSync(dbFile);
  });
  it("should insert a note from string", function(done) {
    note.new(d, {
      data: "hello world"
    }, function(err, id) {
      assert(!err);
      assert(id >= 0);
      note.loadById(d, id, function(e, n) {
        assert(!e);
        assert(n.data === "hello world");
        note.loadById(d, 1234, function(e, n) {
          assert(e);
          done();
        })
      })
    })
  });

  it("should get / add /rm its tags", function(done) {
    note.new(d, {
      data: "hello world"
    }, function(err, id) {
      assert(!err);
      assert(id >= 0);
      note.getTags(d, id, function(e, tags) {
        assert(!e);
        assert(tags.length === 0);
        note.addTags(d, id, ["me", "you"], function(e) {
          assert(!e);
          note.getTags(d, id, function(e, tags) {
            assert(!e);
            assert(tags.length === 2);
            assert(tags[1] === "you");
            note.rmTags(d, id, ["you"], function(e) {
              assert(!e);
              note.getTags(d, id, function(e, tags) {
                assert(!e);
                assert(tags.length === 1);
                assert(tags[0] === "me");
                done();
              });
            })
          });
        })
      })
    })
  });

  it("should search by text. text can be in body or tags", function(done) {
    note.new(d, {
      data: "some text this is a test"
    }, function(err, id) {
      assert(!err);
      assert(id >= 0);
      note.addTags(d, id, ["a fantastic tag"], function(err) {
        assert(!err);
        note.searchText(d, "test", function(err, notes) {
          assert(!err);
          assert(notes.length === 1);
          assert(notes[0].data === "some text this is a test");
          note.searchText(d, "", ["a fantastic tag"],function(err, notes) {
            assert(!err);
            assert(notes.length === 1);
            assert(notes[0].data === "some text this is a test");
            done();
          });
        });
      })
    })
  });

  it("should search by text even no tag", function(done) {
    note.new(d, {
      data: "this is a special test"
    }, function(err, id) {
      assert(!err);
      assert(id >= 0);
      assert(!err);
      note.searchText(d, "special", function(err, notes) {
        assert(!err);
        assert(notes.length === 1);
        assert(notes[0].data === "this is a special test");
        done();
      });
    })
  });

  it("should remove a note", function(done) {
    note.new(d, {
      data: "this is a note to be removed"
    }, function(err, id) {
      assert(!err);
      assert(id >= 0);
      assert(!err);
      note.rmNote(d, id, function(err) {
        assert(!err);
        note.searchText(d,"removed",function(err,notes){
          assert(!err);
          assert(notes.length===0);
          done();
        })
      });
    })
  });

  it("should update a note", function(done) {
    note.new(d, {
      data: "this is a note to be updated"
    }, function(err, id) {
      assert(!err);
      assert(id >= 0);
      assert(!err);
      note.update(d, id,{title:"title added"}, function(err) {
        assert(!err);
        note.searchText(d,"updated",function(err,notes){
          assert(!err);
          assert(notes.length===1);
          assert(notes[0].title=="title added");
          done();
        })
      });
    })
  });
});
