const Chat = require('../models/Chat');
const User = require('../models/User');

const testUsers = [
    {
        firstName: 'Alice',
        lastName: 'Smith',
    },
    {
        firstName: 'Emily',
        lastName: 'Brown',
    },
    {
        firstName: 'Michael',
        lastName: 'Johnson',
    },
    {
        firstName: 'David',
        lastName: 'Williams',
    },
    {
        firstName: 'James',
        lastName: 'Jones',
    },
]

async function initDB() {
    try {
        let anonymousUser = await User.findOne({ isAnonymous: true });
        if (!anonymousUser) {
            const anonymous = new User({
                firstName: 'Anonymous',
                lastName: 'User',
                isAnonymous: true,
            });
            anonymous.imageUrl = `${process.env.AVATAR_URL}${anonymous._id}`;
            anonymousUser = anonymous;
            await anonymous.save();
        }

        const userCount = await User.countDocuments();
        for (let i = userCount; i < 4; i++) {
            const user = new User(testUsers[i]);
            user.imageUrl = `${process.env.AVATAR_URL}${user._id}`;
            const chat = new Chat({ users: [user._id, anonymousUser._id] });
            await user.save();
            await chat.save();
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = { initDB };