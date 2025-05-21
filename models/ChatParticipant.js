const mongoose = require('mongoose');

const chatParticipantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
    },
    lastReadAt: {
        type: Date,
    }
}, { timestamps: true });

module.exports = mongoose.model('Chat-Participant', chatParticipantSchema);