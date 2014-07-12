var rolodex = require("rolodex");
var uuid    = require("uuid");
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
  
  var self = this;
  var rol = rolodex(options.rolodex);
  var user = {
    rolodex: rol,
    // verifies that fields match
    // assigns session variables
    // executes callback with error boolean
    // cb(errors, token, account)
    login: function (username, password, cb) {
      console.log("asda", arguments);
      this.rolodex.account.authenticate({ username: username }, password, function (errors, account) {
        if (errors) {
          self.emit("login_error", errors);
          cb(errors, null, null);
        } else {
          this.rolodex.account.set({ username: username }, { token: token }, function (errors, account) {
            var token = uuid.v4();
            if (errors) {
              this.emit("login_error", errors);
              cb(errors, null, null);
            } else {
              this.emit("login_success", token, account);
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
    signup: function (userData, cb) {
      var self = this;
      this.rolodex.account.set(userData, function (errors, account) {
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

  var emitter = new Emitter()

  this.rolodex = rol;
  this.user = user;
  this.on = emitter.on;
  this.emit = emitter.emit;

  return this;
}

// var dk = new Doorkeeper({ ... });

// dk.user.login({ username, password, cb });

// dk.user.signup({ username, password, meta, cb); // register, create

// dk.user.logout()

// dk.user.update()

module.exports = Doorkeeper;