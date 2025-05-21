const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');
const ChatParticipant = require('../models/ChatParticipant');
const { getRandomQuote, getMultipleRandomQuotes } = require('../services/randomQuotes');
const { sendMessage } = require('../utils/chatUtils');
const intervals = require('../utils/intervals');
const passport = require('../auth/passport');

router.post('/send/message', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const userId = req.user.id;
            let { chatId, content } = req.body;

            const chat = await Chat.findById(chatId);

            if (!chat) {
                return res.status(404).json({ message: 'Chat not found' });
            }
            if (!chat.users.some(user => user._id.toString() === userId.toString())) {
                return res.status(403).json({ message: 'You are not allowed to access this chat' });
            }

            const receiverId = chat.users.find(user => user._id.toString() !== userId.toString());
            const receiver = await User.findById(receiverId);

            await sendMessage(chat._id, userId, receiverId, content);

            if (!receiver.googleId) {
                setTimeout(async () => {
                    const randomQuote = await getRandomQuote();

                    await sendMessage(chat._id, receiverId, userId, randomQuote);
                }, 3000);
            }

            res.status(200).json({ message: 'Message sent successfully' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error sending message' });
        }
    });

router.get('/automatic/enable', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const userId = req.user.id;
            if (intervals.has(userId.toString())) {
                return res.status(200).json({ message: 'Automatic messages are already enabled' });
            }

            const chats = await Chat.find({
                users: userId,
            }).populate({ path: 'users', select: 'googleId' });

            const filteredChats = chats.filter(chat => {
                return chat.users.some(u =>
                    !u.googleId && (u._id.toString() !== userId.toString())
                );
            });

            if (filteredChats.length === 0) {
                return res.status(404).json({ message: 'No chats found' });
            }

            let randomQuotes = await getMultipleRandomQuotes(50);

            intervals.set(userId.toString(), setInterval(async () => {
                if (randomQuotes.length === 0) {
                    randomQuotes = await getMultipleRandomQuotes(50);
                }

                const chat = filteredChats[Math.floor(Math.random() * filteredChats.length)];
                const sender = chat.users.find(element => element._id.toString() !== userId.toString());

                const quote = randomQuotes.shift();

                await sendMessage(chat._id, sender._id, userId, quote);
            }, 3000));

            res.status(200).json({ message: 'Automatic messages enabled successfully' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error enabling automatic messages' });
        }
    });

router.get('/automatic/disable', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const userId = req.user.id;

            if (!intervals.has(userId.toString())) {
                return res.status(200).json({ message: 'Automatic messages are already disabled' });
            }

            clearInterval(intervals.get(userId.toString()));
            intervals.delete(userId.toString());

            res.status(200).json({ message: 'Automatic messages disabled successfully' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error disabling automatic messages' });
        }
    });

router.get('/', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const userId = req.user.id;

            const populatedChats = await Chat.find({
                users: userId,
            }).populate('users');

            const chatParticipant = await ChatParticipant.find({ userId });
            const unreadCounts = await Promise.all(chatParticipant.map(async (participant) => {
                const count = await Message.countDocuments({
                    chatId: participant.chatId,
                    sender: { $ne: userId },
                    createdAt: { $gt: participant.lastReadAt || new Date(0) }
                });

                return {
                    chatId: participant.chatId,
                    count,
                };
            }));

            const otherUsers = populatedChats.map(chat =>
                chat.users.find(user => user._id.toString() !== userId.toString())
            );

            const chats = populatedChats.map(chat => ({
                ...chat._doc,
                users: chat.users.map(user => user._id)
            }))

            res.json({
                chats: chats,
                users: otherUsers,
                unreadCounts,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error retrieving chats' });
        }
    });

router.get('/:chatId', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const userId = req.user.id;
            const { chatId } = req.params;
            const chat = await Chat.findById(chatId);

            if (!chat) {
                return res.status(404).json({ message: 'Chat not found' });
            }
            if (!chat.users.some(user => user._id.toString() === userId.toString())) {
                return res.status(403).json({ message: 'You are not allowed to access this chat' });
            }

            const interlocutorId = chat.users.find(user => user._id.toString() !== userId.toString());
            const interlocutor = await User.findById(interlocutorId);

            const messages = await Message.find({ chatId });
            const chatParticipant = await ChatParticipant.findOne({ chatId, userId });
            if (chatParticipant) {
                chatParticipant.lastReadAt = new Date(Date.now());
                await chatParticipant.save();
            }
            return res.json({
                messages: messages.reverse(),
                user: interlocutor,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error retrieving chat' });
        }
    });

router.get('/create/:userId', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const userId = req.user.id;
            const { userId: receiverId } = req.params;

            const existingChat = await Chat.findOne({ users: { $all: [userId, receiverId] } });
            if (existingChat) {
                return res.status(200).json({ message: 'Chat already exists' });
            }

            if (userId.toString() === receiverId.toString()) {
                return res.status(400).json({ message: 'You cannot create a chat with yourself' });
            }
            const receiver = await User.findById(receiverId);
            if (!receiver.googleId) {
                return res.status(400).json({ message: 'The receiver must be a registered user' });
            }
            const chat = new Chat({ users: [userId, receiverId] });
            const chatParticipant = new ChatParticipant({ userId, chatId: chat._id });
            const chatParticipant2 = new ChatParticipant({ userId: receiverId, chatId: chat._id });

            await chat.save();
            await chatParticipant.save();
            await chatParticipant2.save();
            res.status(200).json({ message: 'Chat created successfully' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error creating chat' });
        }
    });

router.delete('/:chatId', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const userId = req.user.id;

            const { chatId } = req.params;
            const chat = await Chat.findById(chatId);

            if (!chat) {
                return res.status(404).json({ message: 'Chat not found' });
            }
            if (!chat.users.some(user => user._id.toString() === userId.toString())) {
                return res.status(403).json({ message: 'You are not allowed to access this chat' });
            }

            const deletedChat = await Chat.findByIdAndDelete(chatId);
            if (deletedChat) {
                await Message.deleteMany({
                    chatId,
                });
                await ChatParticipant.deleteMany({
                    chatId,
                });
                const interlocutorId = deletedChat.users.find(user => user._id.toString() !== userId.toString());
                const interlocutor = await User.findById(interlocutorId);
                if (!interlocutor.googleId) {
                    await User.findByIdAndDelete(interlocutorId);
                }
                global.io.to(interlocutorId.toString()).emit('chatDeleted');
            }
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error deleting user' });
        }
    });

module.exports = router;