# The Blended Circle Community - Client

This is the frontend client for The Blended Circle Community application, built with React, TypeScript, and Vite.

## Setup Instructions

### Prerequisites
- Node.js (v18.x or higher)
- npm or yarn

### Installation

1. Clone the repository (if you haven't already):
```bash
git clone https://github.com/yourusername/TheBlendedCircleCommunity.git
cd TheBlendedCircleCommunity
```

2. Install dependencies:
```bash
# Install root project dependencies
npm install

# Install client-specific dependencies
cd client
npm install
```

3. Environment Configuration:
   - Copy the example environment file to create your own:
   ```bash
   cp client/.env.example client/.env
   ```
   - Edit the `.env` file with your configuration:
     - `VITE_API_URL`: The URL of the backend API (default: http://localhost:5000/api)
     - `VITE_WS_URL`: The WebSocket URL (default: ws://localhost:5000/ws)

### Running the Client

#### Development Mode
```bash
cd client
npm run dev
```

This will start the development server on port 3000. You can access it at:
```
http://localhost:3000
```

#### Production Build
```bash
cd client
npm run build
npm run preview
```

## Features

- **Authentication**:
  - User registration and login
  - Session-based authentication

- **UI Components**:
  - Uses Shadcn UI for modern interface components
  - Responsive design for mobile and desktop

- **Real-time Features**:
  - Chat functionality via WebSockets
  - Live events

## Working with the API

The client is configured to connect to the backend server running on port 5000. The connection settings are defined in:

- `src/config.ts` - Default configuration
- `.env` file - Environment-specific overrides

## Development Notes

- The client uses Vite for fast development and building
- React Query is used for data fetching and caching
- Authentication state is managed through a Context API provider
- The project uses TypeScript for type safety 