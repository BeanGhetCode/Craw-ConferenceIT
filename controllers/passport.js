const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const models = require('../models');

// Hàm được gọi khi xác thực thành công, lưu thông tin vào session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Hàm được gọi để lấy thông tin lưu vào req.user
passport.deserializeUser(async (id, done) => {
    try {
        let user = await models.User.findOne({
            attributes: ['id', 'email', 'fullname'],
            where: { id }
        });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    if (email) {
        email = email.toLowerCase();
    }
    try {
        if (!req.user) {
            let user = await models.User.findOne({
                where: { email }
            });
            if (!user) {
                return done(null, false, req.flash('LoginMessage', 'Email does not exist!'));
            }
            if (!bcrypt.compareSync(password, user.password)) {
                return done(null, false, req.flash('LoginMessage', 'Invalid Password'));
            }
            return done(null, user);
        }
        done(null, req.user);
    } catch (error) {
        done(error);
    }
}));

module.exports = passport;
