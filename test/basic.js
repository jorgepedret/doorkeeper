var should  = require("should");
var dk      = require("../index")({ rolodex: { role: "master" } });
var mockUsers   = require("./mock/users");
var mockEmails   = require("./mock/emails");

var validUser   = mockUsers.valid;
var validEmail   = mockEmails.valid;
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

    it("should update user data", function (done) {
      done();
    });

    it("should change user’s password", function (done) {
      dk.changePassword(loginToken, validUser.password, validUser.new_password, function (errors, account) {
        should.not.exist(errors);
        dk.login({ email: validUser.email }, validUser.password, function (errors, token, account) {
          should.exist(errors);
          dk.login({ email: validUser.email }, validUser.new_password, function (errors, token, account) {
            should.not.exist(errors);
            loginToken = token;
            done();
          });
        });
      });
    });

    it("should logout user (expire token)", function (done) {
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

    it("should reset user’s password", function (done) {
      // Generate reset password token
      dk.resetPassword({ email: "jorge@chloi.io" }, function (errors, resetToken, account) {
        should.not.exist(errors);
        should.exist(account);
        // Use the generated reset password token to reset the account password
        dk.resetPasswordConfirm({ email: validUser.email }, resetToken, validUser.password, function (errors, account) {
          should.not.exist(errors);
          // Test the new password by loging in
          dk.login({ email: validUser.email }, validUser.password, function (errors, token, account) {
            should.not.exist(errors);
            done();
          });
        });
      });
    });

    it("should email user", function (done) {
      dk.email({ email: validUser.email }, validEmail, function (errors, message) {
        should.not.exist(errors);
        should.exist(message);
        message.should.have.property("to", validUser.email);
        done();
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
});