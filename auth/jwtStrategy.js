const dotenv = require('dotenv');
dotenv.config();
const { Strategy: JwtStrategy } = require('passport-jwt');

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt'];
    }
    return token;
};

const cookieProps = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/',
}

const strategy = (passport) => {
    const opts = {
        jwtFromRequest: cookieExtractor,
        secretOrKey: process.env.JWT_SECRET,
    };

    passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            return done(null, jwt_payload);
        } catch (err) {
            return done(err, false);
        }
    }));
};

module.exports = { strategy, cookieProps };
