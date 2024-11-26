# Voice Todo Manager

A modern, voice-powered todo application built with Next.js, TypeScript, and OpenAI. Speak your tasks and let AI handle the rest!

## Features

- Voice input for task creation
- AI-powered task transcription using OpenAI Whisper
- Automatic time estimation using GPT
- Beautiful, responsive UI with Tailwind CSS
- Real-time task management
- SQLite database with Prisma ORM

## Prerequisites

- Node.js (v16 or higher)
- OpenAI API key
- SQLite

## Setup

1. Clone the repository
```bash
git clone <repository-url>
cd voice-todo-next
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY=your_openai_api_key
```

4. Initialize the database
```bash
npx prisma db push
```

5. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

1. Click the "Start Recording" button to begin recording your task
2. Speak your task clearly
3. Click "Stop Recording" when finished
4. The AI will transcribe your speech, create a task, and estimate the time required
5. Manage your tasks using the intuitive interface:
   - Mark tasks as complete/incomplete
   - Edit task details
   - Delete tasks
   - View completed tasks in the "Previous Todos" section

## Tech Stack

- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS
- Prisma
- OpenAI (Whisper & GPT)
- SQLite

## Project Structure

```
voice-todo-next/
├── app/
│   ├── api/          # API routes
│   ├── components/   # React components
│   ├── types.ts      # TypeScript types
│   └── page.tsx      # Main page
├── prisma/
│   └── schema.prisma # Database schema
└── public/           # Static assets
```

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

MIT
