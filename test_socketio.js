// Quick Socket.IO test to verify connection and messaging
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  path: '/ws',
  autoConnect: true
});

socket.on('connect', () => {
  console.log('✅ Test Socket.IO connected:', socket.id);
  
  // Join a channel
  socket.emit('join_channel', { channelId: 'general' });
  
  // Send a test message
  setTimeout(() => {
    socket.emit('new_message', {
      type: 'new_message',
      channelId: 'general',
      content: 'Socket.IO test from Node.js',
      authorId: 1,
      data: {
        content: 'Socket.IO test from Node.js',
        channelId: 'general',
        authorId: 1
      }
    });
  }, 1000);
});

socket.on('new_message', (message) => {
  console.log('📨 Received message:', message);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected');
});

setTimeout(() => {
  socket.disconnect();
  console.log('🔚 Test completed');
  process.exit(0);
}, 5000);