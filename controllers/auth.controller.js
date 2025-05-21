const jwt = require('jsonwebtoken');
const { cookieProps } = require('../auth/jwtStrategy');

exports.googleAuthCallback = (req, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET);
    res.cookie('jwt', token, cookieProps);
    res.redirect(`${process.env.CLIENT_URL}`);
};

exports.logout = (req, res) => {
    res.cookie('jwt', '', cookieProps);
    res.redirect(`${process.env.CLIENT_URL}`);
};
