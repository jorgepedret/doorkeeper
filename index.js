var rolodex = require("rolodex");
var uuid    = require("uuid");
var _       = require("lodash");
var Emitter = require("events").EventEmitter;

// config options:
// - send verification email
// - login after signup
// - email templates
// - session expiry
// - email on password change
// - redis options
// - identifier (default: username)

// Terminology:

// token: Temporary id associated with the user. It gets randomly generated on every login. It expires if there's a time in the config. It gets deleted on logout. It's required to make calls that affect the owner of the token.

var Doorkeeper = function (options) {
  this.rolodex = rolodex(options.rolodex);
  this.events = new Emitter();
  this.on = this.events.on;
  this.emit = this.events.emit;
}

Doorkeeper.prototype.user = {

  // verifies that fields match
  // assigns session variables
  // executes callback with error boolean
  // cb(errors, token, account)
  login: function (username, password, cb) {
    this.rolodex.validate({ username: username }, password, function (errors, account) {
      if (errors) {
        this.events.emit("login_error", errors);
        cb(errors, null, null);
      } else {
        this.rolodex.set({ username: username }, { token: token }, function (errors, account) {
          var token = uuid.v4();
          if (errors) {
            this.events.emit("login_error", errors);
            cb(errors, null, null);
          } else {
            this.events.emit("login_success", token, account);
            cb(null, token, account);
          }
        });
      }
    });
  },

  // creates a new record with the data passed
  // sends a verification email to the user if config true
  // if not send a welcome email
  // cb gets passed an error (null|object) and the user object if there were no errors.
  // cb(errors, user)
  signup: function (username, password, userData, cb) {
    var data = userData, self = this;
    data.username = username;
    data.password = password;
    this.rolodex.set(data, function (errors, account) {
      if (errors) {
        cb(errors, null);
      } else {
        // self.email(account.email, )
        cb(null, account);
      }
    });
  },

  logout: function (token, cb) {
    // resets the session variables
    // cb(errors)
  },

  update: function (token, userData, cb) {
    // updates the user data basend on the token
    // cb(errors, user)
  },

  changePassword: function (token, oldPassword, newPassword, cb) {
    // if token and oldPassword match, the change password for newPassword
    // Email user if config true
    // cb(errors, user);
  },

  resetPassword: function (identifier, cb) {
    // *identifier can be email or username
    // if identifier can be matched to a user then
    // generate resetToken associated with the user
    // send reset password email to user with resetToken
    // cb(errors)
  },

  resetPasswordConfirm: function (identifier, resetToken, newPassword, cb) {
    // if identifier and resetToken match
    // update password field with newPassword
    // cb(errors, user)
  },

  destroy: function (identifier, cb) {
    // removes the user completely
    // cb(errors)
  },

  email: function (to, subject, message, cb) {

  }
}

// var dk = new Doorkeeper({ ... });

// dk.user.login({ username, password, cb });

// dk.user.signup({ username, password, meta, cb); // register, create

// dk.user.logout()

// dk.user.update()

module.exports = Doorkeeper;