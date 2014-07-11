var app     = require("../index");
var should  = require("should");
var Doorkeeper = require("../index");

var dk = new Doorkeeper({
  rolodex: {
    role: "master"
  }
});

describe("Doorkeeper", function () {
  
  describe("basic", function () {
    it("should have proper structure", function (done) {
      dk.should.be.ok;
      dk.should.be.instanceOf(Object);
      dk.should.have.property("rolodex");
      dk.should.have.property("user");
      done();
    });
  });

  describe("user", function () {
    it("should have properties", function (done) {
      dk.user.should.be.ok;
      dk.user.should.have.property("login");
      done();
    });
  });
  
  describe("events", function () {
    
    it("should trigger event", function (done) {
      dk.on("doh", function () {
        done();
      });
      dk.emit("doh");
    });

    it("should trigger event with arguments", function (done) {
      dk.on("foo", function (arg1) {
        arg1.should.eql("blah");
        done();
      });
      
      dk.emit("foo", "blah");
    });
  });
});