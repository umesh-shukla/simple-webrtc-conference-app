# Simple WebRTC Conference Room App

A complete WebRTC-based conference room application using LiveKit for real-time audio/video communication. Features a React frontend with room creation/joining capabilities and a Node.js backend API.

## Features

- ✅ **Create conference rooms** - Hosts can create new rooms with custom names
- ✅ **Join existing rooms** - Participants can join rooms using room names
- ✅ **Real-time video/audio** - LiveKit-powered WebRTC streaming
- ✅ **Multi-participant support** - Multiple users can join the same room
- ✅ **Camera/microphone access** - Automatic device permission handling
- ✅ **Responsive UI** - Clean, modern interface for room management
- ✅ **Room sharing** - Share room URLs with others to join

## Architecture

- **Backend**: Node.js + Express + LiveKit Server SDK
- **Frontend**: React + LiveKit Client SDK
- **Real-time**: WebRTC via LiveKit Cloud
- **State Management**: React hooks for local state

## Prerequisites

- Node.js (v14 or higher)
- LiveKit Cloud account and credentials
- npm or yarn

## Setup

### 1. **Clone and install dependencies**

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. **Configure environment variables**

```bash
# Backend configuration
cp env.example .env
```

Edit `.env` and add your LiveKit credentials:
```env
LIVEKIT_API_KEY=your_livekit_api_key_here
LIVEKIT_API_SECRET=your_livekit_api_secret_here
LIVEKIT_URL=wss://your-livekit-server.com
PORT=4000
NODE_ENV=development
```

```bash
# Frontend configuration
cd client
# Create .env file (if needed for custom API URL)
echo "REACT_APP_API_BASE=http://localhost:4000/api" > .env
echo "REACT_APP_LIVEKIT_URL=wss://your-livekit-server.com" >> .env
cd ..
```

### 3. **Get LiveKit credentials**

- Sign up at [livekit.io](https://livekit.io)
- Create a new project
- Copy your API key and secret from the project settings
- Use the server URL from your project dashboard

### 4. **Start the servers**

```bash
# Terminal 1: Start backend server
node server.js

# Terminal 2: Start frontend development server
cd client
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000

## Usage

### Creating a Room (Host)

1. Visit http://localhost:3000
2. Click "Create New Room"
3. Enter a room name and your name
4. Click "Create Room"
5. Allow camera/microphone permissions
6. Your video preview will appear at the top

### Joining a Room (Participants)

1. Visit http://localhost:3000
2. Enter the room name and your name
3. Click "Join Room"
4. Allow camera/microphone permissions
5. You'll see the host's video and your own preview

### Sharing Rooms

- Share the room URL: `http://localhost:3000/room/room-name`
- Or share the room name for others to join

## API Endpoints

### Health Check
```
GET /api/health
```

### Create Room
```
POST /api/rooms
Content-Type: application/json

{
  "roomName": "my-conference",
  "hostName": "John Doe"
}
```

### Get Room Information
```
GET /api/rooms/:roomId
```

### Join Room
```
POST /api/rooms/:roomId/join
Content-Type: application/json

{
  "participantName": "Jane Smith"
}
```

### List All Rooms
```
GET /api/rooms
```

### Delete Room
```
DELETE /api/rooms/:roomId
```

## Project Structure

```
├── server.js              # Backend server (Express + LiveKit)
├── package.json           # Backend dependencies
├── env.example           # Environment variables template
├── client/               # React frontend
│   ├── src/
│   │   ├── App.js        # Main app with routing
│   │   ├── Home.js       # Home page (create/join)
│   │   ├── CreateRoom.js # Room creation form
│   │   └── Room.js       # Video conference room
│   ├── package.json      # Frontend dependencies
│   └── .env             # Frontend environment variables
└── README.md            # This file
```

## Frontend Components

### Home.js
- Landing page with options to create or join rooms
- Form for joining existing rooms

### CreateRoom.js
- Form for creating new rooms
- Calls backend API to create room
- Navigates to room as host

### Room.js
- Main video conference interface
- Handles LiveKit connection and video streams
- Displays local preview and remote participants
- Manages camera/microphone permissions

## Development

### Backend Development
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### Frontend Development
```bash
cd client
npm start    # Development server with hot reload
npm build    # Production build
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `LIVEKIT_API_KEY` | Your LiveKit API key | Yes |
| `LIVEKIT_API_SECRET` | Your LiveKit API secret | Yes |
| `LIVEKIT_URL` | LiveKit server URL | Yes |
| `PORT` | Backend server port (default: 4000) | No |
| `REACT_APP_API_BASE` | Backend API URL for frontend | No |
| `REACT_APP_LIVEKIT_URL` | LiveKit URL for frontend | No |

## Testing

### Manual Testing
1. **Single participant**: Create a room and verify your video appears
2. **Multiple participants**: Open multiple browser tabs/windows
3. **Cross-browser**: Test with Chrome, Firefox, Safari
4. **Network testing**: Test on different networks

### API Testing
```bash
# Health check
curl http://localhost:4000/api/health

# Create room
curl -X POST http://localhost:4000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"roomName": "test-room", "hostName": "Host User"}'

# Join room
curl -X POST http://localhost:4000/api/rooms/test-room/join \
  -H "Content-Type: application/json" \
  -d '{"participantName": "Guest User"}'
```

## Troubleshooting

### Common Issues

1. **"LiveKit API credentials not configured"**
   - Check your `.env` file has correct API key/secret
   - Restart backend server after changing `.env`

2. **"Room not found"**
   - Create the room first using the frontend or API
   - Ensure backend server is running

3. **No video streams**
   - Allow camera/microphone permissions in browser
   - Check browser console for errors
   - Verify LiveKit Cloud project is active

4. **Participants can't see each other**
   - Check network restrictions (firewall, VPN)
   - Try different network or browser
   - Verify LiveKit Cloud demo works

### Debug Commands

```bash
# Check backend logs
node server.js

# Check frontend logs
cd client && npm start

# Browser console commands
console.log('Connection state:', window.lkRoom?.state);
console.log('Participants:', Array.from(window.lkRoom?.remoteParticipants.values()).map(p => p.identity));
```

## Deployment

### Backend Deployment
- Deploy `server.js` to your preferred Node.js hosting
- Set environment variables on your hosting platform
- Ensure LiveKit credentials are configured

### Frontend Deployment
```bash
cd client
npm run build
# Deploy the build/ folder to your web hosting
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues related to:
- **LiveKit**: Check [LiveKit documentation](https://docs.livekit.io/)
- **WebRTC**: Check browser compatibility and network settings
- **This app**: Open an issue in the repository 