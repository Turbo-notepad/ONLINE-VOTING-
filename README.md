# Online Voting Backend (Server)

Tech stack:
- Node.js + Express + TypeScript
- Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- JWT auth, bcrypt passwords
- Zod validation, rate limiting, CORS

## Setup
1. Copy `.env.example` to `.env` and set values.
2. Install deps:
   npm install
3. Generate client and migrate:
   npx prisma generate
   npx prisma migrate dev --name init
4. Start dev server:
   npm run dev

## API Outline
- POST /auth/login { email, password, role }
- POST /auth/enroll { voter profile }
- GET /elections
- POST /elections (auth: conductor)
- PATCH /elections/:id (auth: conductor)
- DELETE /elections/:id (auth: conductor)
- POST /candidates (auth: conductor)
- PATCH /candidates/:id (auth: conductor)
- DELETE /candidates/:id (auth: conductor)
- POST /votes (auth: voter)

Switch to Postgres: set DATABASE_URL in .env and run migrations.
