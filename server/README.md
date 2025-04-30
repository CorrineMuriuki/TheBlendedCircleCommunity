# The Blended Circle Community - Server

This is the backend server for The Blended Circle Community application, built with Express.js and TypeScript.

## Setup Instructions

### Prerequisites
- Node.js (v18.x or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/TheBlendedCircleCommunity.git
cd TheBlendedCircleCommunity
```

2. Install dependencies:
```bash
npm install
```

3. Environment Configuration:
   - Copy the example environment file to create your own:
   ```bash
   cp server/.env.example server/.env
   ```
   - Edit the `.env` file with your configuration:
     - `PORT`: The port to run the server on (default: 5000)
     - `NODE_ENV`: The environment (development, production)
     - `DATABASE_URL`: Your database connection string
     - `SESSION_SECRET`: A secure secret for session management
     - `MPESA_CONSUMER_KEY` and `MPESA_CONSUMER_SECRET`: Optional M-PESA API credentials

### Running the Server

#### Development Mode
```bash
npm run dev
```

This will start the server on port 5000 (or your configured PORT).

#### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

The server provides several API endpoints:

- Authentication:
  - `POST /api/register`: Register a new user
  - `POST /api/login`: Log in an existing user
  - `POST /api/logout`: Log out the current user
  - `GET /api/user`: Get the current authenticated user

- Chat:
  - Various endpoints for chat functionality
  
- Events:
  - Endpoints for event management
  
- Payments:
  - M-PESA integration (requires valid API credentials)

## WebSocket Connection

The server also provides WebSocket connections for real-time features on:
```
ws://localhost:5000/ws
```

## Notes

- The server uses ES modules
- Authentication is handled with Passport.js and sessions
- Database operations use a custom storage implementation 