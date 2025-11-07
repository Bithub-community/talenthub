# HR Manager

## Prerequisites

- Node.js (v20+)
- pnpm
- Docker & Docker Compose
- OpenSSL (for key generation)

## Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Generate RSA keys (4096-bit)**
   
   ```bash
   # Linux/Mac
   openssl genrsa -out private.pem 4096
   openssl rsa -in private.pem -pubout -out public.pem
   ```
   
   ```powershell
   # Windows (PowerShell)
   openssl genrsa -out private.pem 4096
   openssl rsa -in private.pem -pubout -out public.pem
   ```

3. **Configure environment variables**
   
   Add to `.env` or Docker Compose:
   
   ```bash
   # Linux/Mac
   export AUTH_PRIVATE_KEY=$(cat private.pem | sed 's/$/\\n/' | tr -d '\n')
   export AUTH_PUBLIC_KEY=$(cat public.pem | sed 's/$/\\n/' | tr -d '\n')
   ```
   
   ```powershell
   # Windows (PowerShell)
   $env:AUTH_PRIVATE_KEY = (Get-Content private.pem -Raw) -replace "`r`n", "\n" -replace "`n", "\n"
   $env:AUTH_PUBLIC_KEY = (Get-Content public.pem -Raw) -replace "`r`n", "\n" -replace "`n", "\n"
   ```

4. **Start services**
   ```bash
   docker-compose up -d
   ```

5. **Setup database**
   
   ```bash
   # Linux/Mac
   export DATABASE_URL="postgresql://hr_user:hr_password@localhost:5432/hr_manager"
   cd apps/main-app
   pnpm db:push
   ```
   
   ```powershell
   # Windows (PowerShell)
   $env:DATABASE_URL="postgresql://hr_user:hr_password@localhost:5432/hr_manager"
   cd apps/main-app
   pnpm db:push
   ```

6. **Run development server**
   ```bash
   pnpm dev
   ```

7. **Open** [http://localhost:3000](http://localhost:3000)

## Scripts

- `pnpm dev` - Development server
- `pnpm build` - Production build
- `pnpm start` - Production server
- `pnpm lint` - Lint code
- `pnpm db:push` - Push schema changes
- `pnpm db:migrate` - Run migrations
- `pnpm db:studio` - Database GUI

## Structure

- `apps/main-app` - Next.js application
- `apps/auth-service` - Authentication service
- `packages/` - Shared packages
