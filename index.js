var rolodex = require("rolodex");
var uuid    = require("uuid");
var Emitter = require("events").EventEmitter;
var debug   = require("debug")("Doorkeeper");

// config options:
// - send verification email
// - login after signup
// - email templates
// - session expiry
// - email on password change
// - redis options
// - identifier (default: email)

// Constructor
var Doorkeeper = function (options) {
  var emitter = new Emitter()
  this.options = options||{};
  this.on = emitter.on;
  this.emit = emitter.emit;
  this.init();
}

Doorkeeper.prototype.init = function () {
  debug("init()");
  this.rolodex = rolodex(this.options.rolodex||{role:"master"});
};

// verifies that fields match
// assigns session variables
// executes callback with error boolean
// cb(errors, token, account)
Doorkeeper.prototype.login = function (identifier, password, cb) {
  
  var self = this, loginHandler = null;
  
  debug("login()", identifier);

  if (!cb) {
    cb = password;
    password = null;
  }

  loginHandler = function (errors, account) {
    if (errors) {
      self.emit("login_error", errors);
      cb(errors, null, null);
    } else {
      if (typeof identifier == "object") {
        self.rolodex.account.token(identifier, function (errors, token) {
          if (errors) {
            self.emit("login_error", errors);
            cb(errors, null, null);
          } else {
            self.emit("login_success", token, account);
            cb(null, token, account);
          }
        });
      } else {
        self.emit("login_success", identifier, account);
        cb(null, identifier, account);
      }
    }
  };

  if (typeof identifier == "object") {
    self.rolodex.account.authenticate(identifier, password, loginHandler);
  } else {
    self.rolodex.account.authenticate(identifier, loginHandler);
  }
};

// creates a new record with the data passed
// sends a verification email to the user if config true
// if not send a welcome email
// cb gets passed an error (null|object) and the user object if there were no errors.
// cb(errors, user)
Doorkeeper.prototype.signup = function (userData, cb) {
  var self = this;
  self.rolodex.account.set(userData, function (errors, account) {
    if (errors) {
      cb(errors, null);
    } else {
      cb(null, account);
    }
  });
};

// resets the session variables
// cb(errors)
Doorkeeper.prototype.logout = function (token, cb) {
  var client = this.rolodex.account.locals.client;
  this.rolodex.account.authenticate(token, function (errors, account) {
    if (errors) {
      cb(errors);
    } else {
      client.multi()
        .del("token:" + token)
        .exec(function (err, replies) {
          cb(err);
        });
    }
  });
};

// updates the user data basend on the token
// cb(errors, user)
Doorkeeper.prototype.update = function (token, userData, cb) {
  this.rolodex.account.set(token, userData, function (errors, account) {
    cb(errors, account);
  });
};

// if token and oldPassword match, the change password for newPassword
// Email user if config true
// cb(errors, user);
Doorkeeper.prototype.changePassword = function (token, oldPassword, newPassword, cb) {
  var auth = this.rolodex.account.authenticate, self = this;
  auth(token, function (errors, account) {
    if (errors) {
      cb(errors, null);
    } else {
      auth({ email: account.email }, oldPassword, function (errors, account) {
        if (errors) {
          cb(errors, null);
        } else {
          self.rolodex.account.set(account, { password: newPassword, password_confirmation: newPassword }, function (errors, account) {
            cb(errors, account);
          });
        }
      });
    }
  });
};

// *identifier = { email: "jorge@sample.com" }
// if identifier can be matched to a user then
// generate resetToken associated with the user
// send reset password email to user with resetToken
// cb(errors)
Doorkeeper.prototype.resetPassword = function (identifier, cb) {
  var client = this.rolodex.account.locals.client;
  this.rolodex.account.get(identifier, function (account) {
    var resetToken = exp = null, error;
    if (!account) {
      error = {
        details: {"account": "is not in the system"},
        messages: ["account is not in the system"]
      }
      cb(error);
    } else {
      resetToken = uuid.v4();
      exp = 60 * 60 * 24; // TODO: Move `exp` to a configuration variable
      client.multi()
      .set("resetToken:" + resetToken, account.id)
      .expire("resetToken:" + resetToken, exp)
      .exec(function (errors, replies) {
        if (errors) {
          cb(errors, null, null);
        } else {
          cb(null, resetToken, account);
        }
      });
    }
  });
};

// if identifier and resetToken match
// update password field with newPassword
// cb(errors, user)
Doorkeeper.prototype.resetPasswordConfirm = function (identifier, resetToken, newPassword, cb) {
  var auth = this.rolodex.account.authenticate,
      client = this.rolodex.account.locals.client,
      self = this;
  self.rolodex.account.get(identifier, function (account) {
    if (!account) {
      cb({
        details: {"account": "is not in the system"},
        messages: ["account is not in the system"]
      }, null);
    } else {
      client.get("resetToken:" + resetToken, function (errors, account_id) {
        if (errors) {
          cb(errors, null);
        } else {
          if (account_id !== account.id) {
            cb({
              details: {"account": "is not in the system"},
              messages: ["account is not in the system"]
            }, null);
          } else {
            self.rolodex.account.set(account, { password: newPassword, password_confirmation: newPassword }, function (errors, account) {
              cb(errors, account);
            });
          }
        }
      });
    }
  });
};

// removes the user completely
// cb(errors)
Doorkeeper.prototype.destroy = function (identifier, cb) {
  var self = this;
  self.rolodex.account.del(identifier, function (errors) {
    cb(errors);
  });
};

Doorkeeper.prototype.email = function () {
  
};

module.exports = function (options) {
  return new Doorkeeper(options);
}