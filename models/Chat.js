const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    users: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        required: true,
    },
    lastMessage: {
        content: {
            type: String,
        },
        timestamp: {
            type: Date,
        },
    },
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);