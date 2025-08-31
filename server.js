require('dotenv').config();

const app = require('./app'); // express nodejs frame work all detail inside in this file

const http = require('http');
const { Server } = require('socket.io')
const server = http.Server(app);


const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,  //your FRONTEND_URL which you add in .env file which help backend to understand on which port frontend is running
        methods: ["GET", "POST"],
        credentials: true
    }
})

io.on("connection", (socket) => {
    console.log("⚡️ New User Connected:", socket.id)

    socket.on("join_chat", (chatId) => {
        socket.join(chatId);
        console.log(`user Joined chat: ${chatId}`);
    });

    socket.on("sendMessage", (messageData) => {
        const { chatId, message } = messageData;

        io.to(chatId).emit('received message', message)
    });
    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id)
    })
})

const port = process.env.PORT //server port where server running

// server listen
server.listen(port, () => {
    console.log(`Server running ${port}`)
})

