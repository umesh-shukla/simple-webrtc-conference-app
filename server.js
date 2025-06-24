const express = require('express');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Verify that environment variables are loaded correctly on startup.
const apiKey = process.env.LIVEKIT_API_KEY;
console.log(`[Startup] Verifying LiveKit API Key: ${apiKey ? `loaded, starts with ${apiKey.substring(0, 7)}...` : 'NOT FOUND'}`);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for rooms (in production, use a database)
const rooms = new Map();

// Helper function to generate access token
function generateAccessToken(roomName, participantName) {
  // --- TEMPORARY DEBUGGING: Hardcode credentials to bypass .env issues ---
  const apiKey = "APIZVqPSmHM8B3S";
  const apiSecret = "11aGgE3y6fXVcUdTNwkCEiUpeDYN5wnkdt0BbPWfviEB";
  // const apiKey = process.env.LIVEKIT_API_KEY;
  // const apiSecret = process.env.LIVEKIT_API_SECRET;
  
  if (!apiKey || !apiSecret || !apiKey.startsWith('API')) {
    // throw new Error('LiveKit API key and secret are required');
    console.error("CRITICAL: Hardcoded API Key or Secret is missing or invalid. Please paste them into server.js");
    return;
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
  });
  
  at.addGrant({ roomJoin: true, room: roomName });
  
  const token = at.toJwt();

  console.log('Generated LiveKit token (base64):', token);

  // Log the decoded token claims for debugging
  try {
    const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('Generated LiveKit token claims:', claims);
  } catch (e) {
    console.error('Failed to decode token:', e);
  }

  return token;
}

// Routes

// Create a new room
app.post('/api/rooms', (req, res) => {
  try {
    const { roomName, hostName } = req.body;
    
    if (!roomName || !hostName) {
      return res.status(400).json({ 
        error: 'Room name and host name are required' 
      });
    }

    // Generate room ID if not provided
    const roomId = roomName || uuidv4();
    
    // Check if room already exists
    if (rooms.has(roomId)) {
      return res.status(409).json({ 
        error: 'Room already exists' 
      });
    }

    // Generate access token for the host
    const accessToken = generateAccessToken(roomId, hostName);
    
    // Store room information
    const room = {
      id: roomId,
      name: roomName,
      host: hostName,
      createdAt: new Date().toISOString(),
      participants: [hostName],
      accessToken
    };
    
    rooms.set(roomId, room);

    res.status(201).json({
      success: true,
      room: {
        id: roomId,
        name: roomName,
        host: hostName,
        createdAt: room.createdAt,
        accessToken,
        joinUrl: `${req.protocol}://${req.get('host')}/room/${roomId}`
      }
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ 
      error: 'Failed to create room',
      details: error.message 
    });
  }
});

// Get room information
app.get('/api/rooms/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = rooms.get(roomId);
    if (!room) {
      return res.status(404).json({ 
        error: 'Room not found' 
      });
    }

    res.json({
      success: true,
      room: {
        id: room.id,
        name: room.name,
        host: room.host,
        createdAt: room.createdAt,
        participants: room.participants,
        joinUrl: `${req.protocol}://${req.get('host')}/room/${roomId}`
      }
    });
  } catch (error) {
    console.error('Error getting room:', error);
    res.status(500).json({ 
      error: 'Failed to get room information' 
    });
  }
});

// Join a room (generate access token for participant)
app.post('/api/rooms/:roomId/join', (req, res) => {
  try {
    const { roomId } = req.params;
    const { participantName } = req.body;
    
    if (!participantName) {
      return res.status(400).json({ 
        error: 'Participant name is required' 
      });
    }

    const room = rooms.get(roomId);
    if (!room) {
      return res.status(404).json({ 
        error: 'Room not found' 
      });
    }

    // Generate access token for the participant
    const accessToken = generateAccessToken(roomId, participantName);
    
    // Add participant to room if not already present
    if (!room.participants.includes(participantName)) {
      room.participants.push(participantName);
    }

    res.json({
      success: true,
      accessToken,
      room: {
        id: room.id,
        name: room.name,
        host: room.host,
        participants: room.participants
      }
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ 
      error: 'Failed to join room',
      details: error.message 
    });
  }
});

// List all rooms
app.get('/api/rooms', (req, res) => {
  try {
    const roomList = Array.from(rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      host: room.host,
      createdAt: room.createdAt,
      participantCount: room.participants.length
    }));

    res.json({
      success: true,
      rooms: roomList
    });
  } catch (error) {
    console.error('Error listing rooms:', error);
    res.status(500).json({ 
      error: 'Failed to list rooms' 
    });
  }
});

// Delete a room
app.delete('/api/rooms/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = rooms.get(roomId);
    if (!room) {
      return res.status(404).json({ 
        error: 'Room not found' 
      });
    }

    rooms.delete(roomId);
    
    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ 
      error: 'Failed to delete room' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    livekitConfigured: !!(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET)
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WebRTC Conference Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  
  if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
    console.warn('⚠️  LiveKit API credentials not configured. Please set LIVEKIT_API_KEY and LIVEKIT_API_SECRET in your environment variables.');
  }
});

module.exports = app; 