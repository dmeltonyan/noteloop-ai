# NoteLoop AI - Backend

Express.js REST API with TypeScript.

## Setup

\`\`\`bash
npm install
cp .env.example .env
npm run dev
\`\`\`

API running at [http://localhost:3001](http://localhost:3001)

## Available Scripts

- \`npm run dev\` - Start dev server with auto-reload
- \`npm run build\` - Compile TypeScript
- \`npm run start\` - Start production server
- \`npm test\` - Run tests

## Folder Structure

\`\`\`
src/
├── config/          # Configuration
├── controllers/     # Route handlers
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
└── server.ts        # Entry point
\`\`\`