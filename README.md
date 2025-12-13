# Pascal Real Estate OS

Pascal is the AI-first operating system for real estate developers.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4, Shadcn UI, Motion
- **Database**: Prisma, PostgreSQL
- **Auth**: Better-Auth
- **Realtime**: Pusher
- **Tools**: Biome
- **State Management**: Zustand

## Scripts

### Development

```bash
bun run dev
```

### Build

```bash
bun run build
```

### Start

```bash
bun run start
```

## Access Points

The application serves two main user roles through distinct routes:

- **Lead/Client Interface**: The landing page where users communicate with sales agents.
  - Local: `http://localhost:3000/`
  - Production: `https://pascal-ashen.vercel.app/`

- **Intranet (Agents & Admins)**: The dashboard for sales agents and administrators to manage leads, conversations, and system settings.
  - Local: `http://localhost:3000/intranet`
  - Production: `https://pascal-ashen.vercel.app/intranet`
