const express = require('express');
const router = express.Router();
const passport = require('../auth/passport');
const userController = require('../controllers/user.controller');

router.post('/change', passport.authenticate('jwt', { session: false }), userController.changeUser);

router.get('/@me', userController.getCurrentUser);

router.post('/add', passport.authenticate('jwt', { session: false }), userController.addUser);

router.get(['/list/:email', '/list'], passport.authenticate('jwt', { session: false }), userController.listUsers);

module.exports = router;
