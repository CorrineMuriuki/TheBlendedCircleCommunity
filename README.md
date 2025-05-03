# The Blended Circle Community

A full-stack web application built with React, Express, and PostgreSQL, featuring a modern UI with Tailwind CSS and Shadcn UI components.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js
- **Styling**: Tailwind CSS, Radix UI components
- **State Management**: React Query
- **Form Handling**: React Hook Form with Zod validation

## Prerequisites

Before running the project, ensure you have the following installed:

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

## Environment Setup

1. Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=development
```

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd TheBlendedCircleCommunity
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Push the database schema
npm run db:push
```

## Running the Application

### Development Mode

To run the application in development mode:

```bash
npm run dev
```

This will start both the frontend and backend servers.

### Production Build

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Create a production build
- `npm start` - Start the production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## Project Structure

```
├── client/           # Frontend React application
├── server/           # Backend Express server
├── shared/           # Shared types and utilities
├── public/           # Static assets
└── migrations/       # Database migrations
```

## Features

- Modern UI with Tailwind CSS and Shadcn UI components
- Type-safe development with TypeScript
- Form validation with Zod
- Real-time updates with WebSocket
- Authentication system
- Responsive design
- Database integration with Drizzle ORM

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 