# NoteLoop AI

AI-powered adaptive learning platform that transforms your notes into interactive study materials.

## 🚀 Quick Start

### Prerequisites
- Node.js v20+
- PostgreSQL (via Supabase)
- Git

### Setup

1. Clone the repository:
\`\`\`bash
git clone https://github.com/YOUR-USERNAME/noteloop-ai.git
cd noteloop-ai
\`\`\`

2. Set up Frontend:
\`\`\`bash
cd frontend
npm install
cp .env.example .env.local
# Add your environment variables
npm run dev
\`\`\`

3. Set up Backend:
\`\`\`bash
cd backend
npm install
cp .env.example .env
# Add your environment variables
npm run dev
\`\`\`

## 📁 Project Structure

\`\`\`
noteloop-ai/
├── frontend/          # Next.js frontend
├── backend/           # Express backend
├── shared/            # Shared types and utilities
├── docs/              # Documentation
└── .github/           # GitHub workflows and templates
\`\`\`

## 👥 Team

- **Developer 1**: Frontend (UI/UX)
- **Developer 2**: Backend (API/Database)
- **Developer 3**: AI/ML (OCR/GPT Integration)

## 📖 Documentation

See [docs/](./docs/) for detailed documentation.

## 🤝 Contributing

1. Create a feature branch: \`git checkout -b feature/your-feature\`
2. Commit changes: \`git commit -m "Add your feature"\`
3. Push to branch: \`git push origin feature/your-feature\`
4. Create a Pull Request

## 📝 License

MIT