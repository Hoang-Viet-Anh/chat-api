const Message = require('../models/Message');
const Chat = require('../models/Chat');

async function sendMessage(chatId, senderId, receiverId, content) {
    const message = new Message({
        chatId,
        sender: senderId,
        content
    });
    await message.save();

    await Chat.findByIdAndUpdate(chatId, {
        lastMessage: {
            content,
            timestamp: message.timestamp,
        }
    });

    global.io.to(receiverId.toString()).emit('newMessage', message);
}

module.exports = { sendMessage };