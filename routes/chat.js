const express = require('express');
const router = express.Router();
const passport = require('../auth/passport');
const chatController = require('../controllers/chat.controller');

router.post('/send/message', passport.authenticate('jwt', { session: false }), chatController.sendMessage);
router.get('/automatic/enable', passport.authenticate('jwt', { session: false }), chatController.enableAutoMessages);
router.get('/automatic/disable', passport.authenticate('jwt', { session: false }), chatController.disableAutoMessages);
router.get('/', passport.authenticate('jwt', { session: false }), chatController.getChats);
router.get('/:chatId', passport.authenticate('jwt', { session: false }), chatController.getChatById);
router.get('/create/:userId', passport.authenticate('jwt', { session: false }), chatController.createChat);
router.delete('/:chatId', passport.authenticate('jwt', { session: false }), chatController.deleteChat);

module.exports = router;