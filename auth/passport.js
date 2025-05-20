const passport = require('passport');
require('./googleStrategy')(passport);
require('./jwtStrategy').strategy(passport);
module.exports = passport;
