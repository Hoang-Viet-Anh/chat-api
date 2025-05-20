const dotenv = require('dotenv');
dotenv.config();
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    },
        async (accessToken, refreshToken, profile, done) => {
            const user = await User.findOneAndUpdate(
                { googleId: profile.id },
                {
                    $set: {
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        email: profile.emails?.[0].value,
                        imageUrl: profile.photos?.[0].value,
                    },
                    $setOnInsert: {
                        googleId: profile.id,
                    }
                },
                { upsert: true, new: true }
            );

            return done(null, user);
        }));
};
