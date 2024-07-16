require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const Chat = require('./models/Chat');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
}); 

connectDB();

app.use(cors());
app.use(express.json());
app.use('/api', userRoutes);

const users = {};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('login', (userId) => {
    socket.userId = userId;
    users[userId] = socket.id;
    console.log(`User ${userId} logged in`);
  });

  socket.on('private message', async ({ to, message }) => {
    const recipientSocket = users[to];
    if (recipientSocket) {
      io.to(recipientSocket).emit('private message', {
        from: socket.userId,
        message,
      });
      
      // Store the chat message in the database
      const chat = new Chat({ from: socket.userId, to, message });
      await chat.save();
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    Object.keys(users).forEach(userId => {
      if (users[userId] === socket.id) {
        delete users[userId];
      }
    });
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));