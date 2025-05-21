const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const chatRoutes = require('./routes/chat');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const { startSocket } = require('./utils/socket');
const { initDB } = require('./utils/InitDB');
const http = require('http');
const passport = require('./auth/passport');

const app = express();
const server = http.createServer(app);
startSocket(server);

app.set('trust proxy', true);
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/chat', chatRoutes);
app.use('/user', userRoutes);
app.use('/auth', authRoutes);

mongoose.connect(process.env.MONGODB_URI).then(() => {
    initDB();
    server.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}).catch((err) => {
    console.log(err);
    exit(1);
});