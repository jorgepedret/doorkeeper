var rolodex = require("rolodex");

// config options:
// - send verification email
// - login after signup
// - email templates
// - session expiry
// - email on password change
// - redis options

// Terminology:

// token: Temporary id associated with the user. It gets randomly generated on every login. It expires if there's a time in the config. It gets deleted on logout. It's required to make calls that affect the owner of the token.


var Doorkeeper = function (options) {
  
}

Doorkeeper.prototype.user = {

  login: function (username, password, cb) {
    // verifies that fields match
    // assigns session variables
    // executes callback with error boolean
    // cb(errors, token);
  },

  signup: function (username, password, userData, cb) {
    // creates a new record with the data passed
    // sends a verification email to the user if config true
    // if not send a welcome email
    // cb gets passed an error (null|object) and the user object if there were no errors.
    // cb(errors, user)
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