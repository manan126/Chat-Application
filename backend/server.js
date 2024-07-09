const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

console.log('Starting server...');
console.log('Environment variables loaded');

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

console.log('Express app and Socket.IO server created');

// Middleware
app.use(cors());
app.use(express.json());
console.log('Middleware set up');

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
console.log('MONGO_URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
console.log('Routes set up');

// Test route
app.get('/test', (req, res) => {
  console.log('Test route accessed');
  res.send('Server is running');
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('join', (userId) => {
    console.log(`User ${userId} joined`);
    socket.join(userId);
  });

  socket.on('chat message', (msg) => {
    console.log('Chat message received:', msg);
    io.to(msg.receiverId).emit('new message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.use((err, req, res, next) => {
  console.error('Error caught by error handler:', err.stack);
  res.status(500).send('Something broke!');
});

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} request to ${req.url}`);
  next();
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('/api/auth');
  console.log('/api/chat');
  console.log('/test');
});