var should  = require("should");
var dk      = require("../index")({ rolodex: { role: "master" } });
var mockUsers   = require("./mock/users");

var validUser   = mockUsers.valid;
var loginToken = null;

describe("Doorkeeper", function () {
  
  describe("basic", function () {
    it("should have proper structure", function (done) {
      dk.should.be.ok;
      dk.should.be.instanceOf(Object);
      dk.should.have.property("rolodex");
      dk.should.have.property("login");
      dk.should.have.property("signup");
      done();
    });
  });

  describe("user", function () {
    it("should create user", function (done) {
      dk.signup(validUser, function (errors, account) {
        should.not.exist(errors);
        account.should.be.ok;
        account.should.have.property("email", validUser.email);
        // NOTE: It would be nice to support custom fields
        // account.should.have.property("city", validUser.city);
        done();
      });
    });

    it("should login user", function (done) {
      dk.login({ email: validUser.email }, validUser.password, function (errors, token, account) {
        should.not.exist(errors);
        account.should.be.ok;
        account.should.have.property("email", validUser.email);
        loginToken = token;
        done();
      });
    });

    it("should login user using token", function (done) {
      dk.login(loginToken, function (errors, token, account) {
        should.not.exist(errors);
        account.should.be.ok;
        done();
      });
    });

    it("should logout user", function (done) {
      dk.logout(loginToken, function (errors) {
        should.not.exist(errors);
        dk.login(loginToken, function (errors, token, account) {
          should.exist(errors);
          errors.should.have.property("messages");
          errors.messages[0].should.eql("token is not valid");
          done();
        });
      });
    });

    it("should remove user", function (done) {
      dk.destroy({ email: validUser.email }, function (errors) {
        should.not.exist(errors);
        dk.login({ email: validUser.email }, validUser.password, function (errors, token, account) {
          should.exist(errors);
          errors.should.have.property("messages");
          errors.messages[0].should.eql("account is not in the system");
          done();
        })
      });
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