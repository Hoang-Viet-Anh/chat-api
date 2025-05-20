const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { cookieProps } = require('../auth/jwtStrategy');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }),
    (req, res) => {
        const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET);
        res.cookie('jwt', token, cookieProps);
        res.redirect(`${process.env.CLIENT_URL}`);
    }
);

router.get('/logout', (req, res) => {
    res.cookie('jwt', '', cookieProps);
    res.redirect(`${process.env.CLIENT_URL}`);
});

module.exports = router;