var app     = require("../index");
var should  = require("should");
var dk      = require("../index")({ rolodex: { role: "master" } });
var mockUsers   = require("./mock/users");

var validUser   = mockUsers.valid;

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

    it("should create user", function (done) {
      dk.user.signup(validUser, function (errors, account) {
        should.not.exist(errors);
        account.should.be.ok;
        account.should.have.property("username", validUser.username);
        account.should.have.property("email", validUser.email);
        account.should.have.property("city", validUser.city);
        done();
      });
    });

    it("should login user", function (done) {
      dk.user.login(validUser.username, validUser.password, function (errors, account) {
        should.not.exist(errors);
        account.should.be.ok;
        console.log("ACC: ", account);
        done()
      });
    })
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