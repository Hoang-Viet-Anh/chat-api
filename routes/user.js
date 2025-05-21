const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Chat = require('../models/Chat');
const ChatParticipant = require('../models/ChatParticipant');
const passport = require('../auth/passport');
const { cookieProps } = require('../auth/jwtStrategy');
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');

router.post('/change', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const { firstName, lastName, userId } = req.body;

            const user = await User.findOneAndUpdate(
                { _id: userId, googleId: { $exists: false } }, {
                firstName,
                lastName,
            }, { new: true });

            res.json(user);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error updating user' });
        }
    });

router.get('/@me', async (req, res) => {
    try {
        if (req && req.cookies && req.cookies.jwt) {
            const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
            const userId = decoded.id;
            const user = await User.findById(userId);
            if (user) {
                return res.json(user);;
            }
        }

        const user = await User.findOne({ isAnonymous: true });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.cookie('jwt', token, cookieProps);
        return res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error retrieving user' });
    }
});

router.post('/add', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const userId = req.user.id;
            const { firstName, lastName } = req.body;

            const newUser = new User({ firstName, lastName });
            newUser.imageUrl = `${process.env.AVATAR_URL}${newUser._id}`;
            const chat = new Chat({ users: [newUser._id, userId] });
            const chatParticipant = new ChatParticipant({ userId, chatId: chat._id });

            await newUser.save();
            await chat.save();
            await chatParticipant.save();

            res.json(newUser);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error adding user' });
        }
    });

router.get(['/list/:email', '/list'], passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const userId = req.user.id;
            const filter = req.params.email ?? "";

            const chats = await Chat.find({ users: userId });
            const alreadyAdded = chats.map(chat => chat.users.find(user => user._id.toString() !== userId));
            alreadyAdded.push(new mongoose.Types.ObjectId(String(userId)));
            const users = await User.find({ email: { $regex: filter.toString(), $options: 'i' }, _id: { $nin: alreadyAdded } }).limit(10);

            res.json(users);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error retrieving users list' });
        }
    });

module.exports = router;