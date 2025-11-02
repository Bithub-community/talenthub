# HR Manager

## Local Development Setup

### Prerequisites

- Node.js (v20 or higher)
- pnpm package manager
- Docker and Docker Compose (for database)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hr-manager
   ```

2. **Install dependencies**
   ```bash
   pnpm instal
   ```

3. **Start the database**
   ```bash
   docker-compose up -d
   ```

4. **Set up the database**
   ```bash
    $env:DATABASE_URL="postgresql://hr_user:hr_password@localhost:5432/hr_manager"
   cd apps/main-app
   pnpm db:push
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint
- `pnpm db:push` - Push database schema changes
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio for database management

### Project Structure

This is a monorepo using pnpm workspaces:

- `apps/main-app` - Main Next.js application
- `packages/` - Shared packages and utilities
