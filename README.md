# ChatGPT-Ollama

A ChatGPT-like web interface powered by Ollama for running large language models locally. This application provides a familiar chat interface while leveraging the power of locally hosted AI models through Ollama.
### video
[Cointab.webm](https://github.com/user-attachments/assets/d4824b23-77e8-451a-b935-1fba54727904)

## Tech Stack

### Backend
- **Node.js/Express.js** - Server-side runtime and web framework
- **Ollama** - Local LLM inference engine
- **Database** - SQLite/PostgreSQL for chat history and user sessions
- **WebSocket/Socket.io** - Real-time communication for streaming responses

### Frontend
- **Next.js** - Frontend framework
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Router** - Client-side routing

### Additional Tools
- **Vite** - Build tool and development server
- **ESLint & Prettier** - Code linting and formatting
- **Docker** - Containerization (optional)

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Ollama** (see setup instructions below)

## Setup Instructions

### 1. Ollama Setup

#### Install Ollama
```bash
# For macOS
brew install ollama

# For Linux
curl -fsSL https://ollama.com/install.sh | sh

# For Windows
# Download installer from https://ollama.com/download/windows
```

#### Start Ollama Service
```bash
ollama serve
```

#### Pull Required Models
```bash
# Pull a lightweight model (recommended for testing)
ollama pull gamma3:1b

# Or pull a more capable model (requires more resources)
ollama pull llama3.2:3b
ollama pull mistral:7b
```

#### Verify Installation
```bash
ollama list
```

### 2. Database Setup

#### For PostgreSQL (Optional)
```bash
# Install PostgreSQL
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database
createdb chatgpt_ollama
```

### 3. Project Setup

#### Clone Repository
```bash
git clone https://github.com/Cvr421/ChatGPT-ollama.git
cd ChatGPT-ollama
```

#### Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### Environment Configuration
Create `.env` files in both backend and frontend directories:

**Backend `.env`:**
```env
PORT=3001
OLLAMA_URL=http://localhost:11434
DB_TYPE=postgres
DB_PATH=./database.sqlite

# For PostgreSQL (uncomment if using)
# DB_TYPE=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=chatgpt_ollama
# DB_USER=your_username
# DB_PASSWORD=your_password

NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

## Local Run Instructions

### Development Mode

#### 1. Start Ollama (if not already running)
```bash
ollama serve
```

#### 2. Start Backend Server
```bash
cd backend
npm run dev
```
The backend will start on `http://localhost:3001`

#### 3. Start Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:3000`

#### 4. Access the Application
Open your browser and navigate to `http://localhost:3000`

### Production Mode

#### Build Frontend
```bash
cd frontend
npm run build
```

#### Start Production Server
```bash
cd backend
npm start
```

### Using Docker (Optional)

#### Build and Run with Docker Compose
```bash
docker-compose up --build
```

This will start all services including the application and database.

## Usage

1. **Select Model**: Choose from available Ollama models in the interface
2. **Start Chatting**: Type your message and press Enter or click Send
