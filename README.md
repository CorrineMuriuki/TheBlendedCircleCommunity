# The Blended Circle Community

A full-stack application for building a community of blended families, featuring user authentication, real-time chat, event management, and more.

## Project Structure

This project consists of two main parts:

- **Server**: Express.js backend (runs on port 5000)
- **Client**: React frontend (runs on port 3000)

## Quick Start

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
# Install root project dependencies
npm install

# Install client-specific dependencies if needed
cd client && npm install && cd ..
```

### Running the Application

#### Development Mode: Option 1 - Running Backend Only (Recommended)
The frontend is served by the backend in development mode:

```bash
# From project root
npm run dev
```

Access the application at: http://localhost:5000

#### Development Mode: Option 2 - Running Frontend and Backend Separately
If you want to run the frontend and backend separately:

1. Start the backend:
```bash
# From project root
npm run dev
```

2. Start the frontend (in a separate terminal):
```bash
cd client
npm run dev
```

Backend runs at: http://localhost:5000
Frontend runs at: http://localhost:3000

### Environment Configuration

Both the server and client have their own configuration:

1. Server Configuration:
   ```bash
   cp server/.env.example server/.env
   ```
   Then edit the `.env` file with your server settings.

2. Client Configuration:
   ```bash
   cp client/.env.example client/.env
   ```
   Then edit the `.env` file with your client settings.

## Features

- **User Authentication**: Register, login, profile management
- **Real-time Chat**: WebSocket-based messaging
- **Event Management**: Create and manage events
- **Payment Integration**: M-PESA payment support
- **Responsive UI**: Works on desktop and mobile devices

## Detailed Documentation

For more details on setting up and developing:

- [Server Documentation](./server/README.md)
- [Client Documentation](./client/README.md)

## License

MIT 