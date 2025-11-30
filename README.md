# Kanban App - Personal Project Management

A modern, feature-rich personal kanban board application built with Next.js 14, PostgreSQL, and Tailwind CSS.

## Features

- 🔐 **Authentication** - Secure login with NextAuth.js
- 📊 **Custom Kanban Boards** - Create multiple projects with customizable columns
- ✨ **Drag & Drop** - Intuitive task management with @dnd-kit
- ⏱️ **Time Tracking** - Built-in timer for tracking task duration
- 🎨 **Customization** - Color-coded projects, priorities, and tags
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- ⚡ **Fast & Lightweight** - Optimized performance with Zustand state management

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (raw SQL with postgres.js)
- **Authentication**: NextAuth.js v5
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 12+ installed and running
- npm or yarn package manager

## Installation

1. **Clone or extract the project**
   ```bash
   cd kanban-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and update with your database credentials:
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```
   DATABASE_URL=postgresql://your_user:your_password@localhost:5432/kanban_db
   NEXTAUTH_SECRET=your-super-secret-key-change-this
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Create the database**
   ```bash
   # Using psql
   psql -U postgres
   CREATE DATABASE kanban_db;
   \q
   ```

5. **Run database setup**
   ```bash
   npm run db:setup
   ```

6. **Seed the database with sample data**
   ```bash
   npm run db:seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Login Credentials

After running the seed script, you can login with:

- **Email**: `admin@example.com`
- **Password**: `admin123`

## Project Structure

```
kanban-app/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── projects/         # Projects list and detail pages
│   │   └── layout.tsx        # Dashboard layout with navigation
│   ├── api/                  # API routes
│   │   ├── auth/            # NextAuth endpoints
│   │   ├── projects/        # Project CRUD operations
│   │   └── tasks/           # Task CRUD operations
│   ├── login/               # Login page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/
│   ├── auth/                # Authentication components
│   ├── kanban/              # Kanban board components
│   ├── projects/            # Project-related components
│   ├── tasks/               # Task-related components
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── auth/                # NextAuth configuration
│   └── db/                  # Database connection and queries
├── stores/                  # Zustand state management
├── types/                   # TypeScript type definitions
├── database/                # SQL schema
└── scripts/                 # Database setup and seed scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:setup` - Create database tables
- `npm run db:seed` - Populate database with sample data

## Features Guide

### Projects
- Create multiple projects with custom colors
- Edit project details
- Delete projects (cascades to all tasks and columns)

### Kanban Columns
- Default columns: Inbox, To Plan, To Do, In Progress, Waiting, Done, Archived
- Drag and drop tasks between columns
- Visual indicators for column types (action, waiting, completed)

### Tasks
- Quick add from any column
- Full task details with:
  - Title and description
  - Priority levels (low, medium, high, urgent)
  - Due dates
  - Energy levels (low, medium, high)
  - Tags for organization
- Drag and drop to reorder or move between columns
- Built-in timer for time tracking

### Time Tracking
- Start/stop/reset timer for any task
- Automatically saves time spent
- Display total time on task cards

### State Management
- Optimistic UI updates for instant feedback
- Real-time synchronization with backend
- Persisted data in PostgreSQL

## Customization

### Adding New Columns
You can create custom columns with different types:
- **Action**: Regular workflow columns
- **Waiting**: For blocked or waiting tasks
- **Completed**: For finished or archived tasks

### Color Schemes
Projects and tags support custom colors. The UI uses these colors for:
- Project cards and headers
- Column indicators
- Priority badges
- Tag labels

## Database Schema

The app uses a normalized PostgreSQL schema with the following main tables:

- `users` - User accounts
- `projects` - Project definitions
- `columns` - Kanban columns per project
- `tasks` - Individual tasks
- `tags` - Reusable tags
- `task_tags` - Many-to-many relationship
- `activity_logs` - Activity tracking

See `database/schema.sql` for complete schema definition.

## Production Deployment

1. Set up a PostgreSQL database (e.g., on Railway, Supabase, or AWS RDS)
2. Update environment variables with production values
3. Run database setup and seed scripts
4. Build the application: `npm run build`
5. Deploy to Vercel, Netlify, or your preferred hosting platform

### Environment Variables for Production
```
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_SECRET=generate-a-strong-random-secret
NEXTAUTH_URL=https://your-domain.com
```

## Security Notes

- Change the `NEXTAUTH_SECRET` in production
- Use strong passwords
- Enable HTTPS in production
- Keep dependencies updated
- Review and adjust CORS settings if needed

## Contributing

This is a personal project template. Feel free to fork and customize for your needs.

## License

MIT License - Free to use and modify

## Support

For issues or questions:
1. Check the database connection in `.env`
2. Ensure PostgreSQL is running
3. Verify Node.js version (18+)
4. Review console logs for errors

## Acknowledgments

Built with:
- Next.js - React framework
- PostgreSQL - Database
- Tailwind CSS - Styling
- NextAuth.js - Authentication
- Zustand - State management
- @dnd-kit - Drag and drop
