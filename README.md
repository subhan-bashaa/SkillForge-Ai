# SkillForge AI 🚀

SkillForge AI is an AI-powered personalized learning platform that generates customized course roadmaps, provides an interactive context-seeded AI Mentor, and generates dynamic quizzes based on your specific learning goals and career objectives.

---

## 📸 Screenshots & UI

*(Once deployed, add screenshots/GIFs here showcasing the Dashboard, Course View, AI Mentor chat, and Leaderboard!)*

---

## ✨ Features

- **Personalized Course Generation**: Input your goal, target career role, learning level, daily time commitment, and learning style to generate structured modules, lessons, suggested project briefs, and curated resource links.
- **Context-Seeded AI Mentor**: Chat with an AI tutor that is fully aware of your enrolled courses and can explain topics, debug code, and guide you through assignments.
- **Dynamic AI Quizzes**: Generate custom multiple-choice quizzes for any lesson with an active timer, automatic grading, and immediate rationales for questions.
- **Learning Analytics & Gamification**: Track your study streak, earn experience points (XP), visualize progress with charts, and compete on the global quiz leaderboard.
- **Bookmarks & Notes**: Bookmark critical lessons and take localized markdown notes directly alongside the learning material.
- **Secure Authentication**: Robust registration, login, and profile management secured by JSON Web Tokens (JWT) and encrypted passwords.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (via Vite)
- **Styling**: Tailwind CSS, React Icons
- **Animations**: Framer Motion
- **Data Visualization**: Recharts (for analytics and streak charts)
- **HTTP Client**: Axios

### Backend
- **Framework**: Flask (Python 3.10+)
- **Database ORM**: SQLAlchemy with PostgreSQL (managed relational store)
- **Authentication**: Flask-JWT-Extended (JWT access tokens)
- **Database Migrations**: Flask-Migrate (Alembic wrappers)
- **CORS Support**: Flask-Cors

### AI Core
- **Client**: Groq SDK
- **Inference Engine**: Llama 3.3 (70B Versatile Model)

---

## 📐 Architecture Diagram

```mermaid
graph TD
    subgraph Frontend [React SPA - Vercel]
        UI[Vite + React UI]
        State[AuthContext & React State]
        AxiosClient[Axios API Client]
        UI --> State
        State --> AxiosClient
    end

    subgraph Backend [Flask REST API - Render]
        FlaskServer[Flask App]
        Routes[API Blueprint Routes]
        Services[AI & Course Services]
        Models[SQLAlchemy Models]
        
        AxiosClient -- JWT Secure Requests --> FlaskServer
        FlaskServer --> Routes
        Routes --> Services
        Services --> Models
    end

    subgraph External [External Services & Database]
        PostgreSQL[(PostgreSQL DB)]
        Groq[Groq AI API - Llama 3.3]
        
        Models --> PostgreSQL
        Services -- SDK Calls (API Key) --> Groq
    end
    
    style Frontend fill:#1e1b4b,stroke:#4f46e5,stroke-width:2px,color:#fff
    style Backend fill:#0f172a,stroke:#0ea5e9,stroke-width:2px,color:#fff
    style External fill:#1c1917,stroke:#292524,stroke-width:2px,color:#fff
```

---

## 📂 Folder Structure

```text
SkillForge-AI/
├── backend/
│   ├── app/
│   │   ├── models/            # SQLAlchemy Database Models
│   │   ├── routes/            # Flask API Blueprints (Auth, Course, Mentor, etc.)
│   │   ├── services/          # Groq Client and Business Logic Services
│   │   ├── utils/             # Helper Functions
│   │   └── __init__.py        # App Factory Setup
│   ├── migrations/            # Flask-Migrate Database History
│   ├── instance/              # Runtime instance files
│   ├── requirements.txt       # Python Dependencies (Flask, SQLAlchemy, Groq, gunicorn)
│   └── run.py                 # Backend Entrypoint (Development server)
├── frontend/
│   ├── public/                # Static public assets
│   ├── src/
│   │   ├── assets/            # Local UI SVGs and Images
│   │   ├── components/        # Reusable UI Components (Navbar, Sidebar, AuthModal)
│   │   ├── context/           # React Authentication Context
│   │   ├── pages/             # Lazy-loaded Router Pages (Dashboard, AI Mentor, etc.)
│   │   ├── api.js             # Axios Client Instance (with JWT auto-injection)
│   │   ├── App.jsx            # Router Setup & Performance Code Splitting
│   │   ├── main.jsx           # React Entrypoint
│   │   └── index.css          # Tailwind Directives & Global CSS Variables
│   ├── vite.config.js         # Vite compilation config
│   └── package.json           # Frontend Dependencies and Build Scripts
├── .gitignore                 # Universal Git Exclusions
├── .env.example               # Template Environment Variables file
├── LICENSE                    # MIT License
└── README.md                  # Comprehensive Documentation
```

---

## 🔑 Environment Variables

The project reads configuration variables from environment variables or a local `.env` file inside the `backend` directory.

Copy `.env.example` to `backend/.env`:
```bash
cp .env.example backend/.env
```

Define the following variables inside `backend/.env`:
- `SECRET_KEY`: A random string used for secure session cookie signing.
- `JWT_SECRET_KEY`: A secure key used for signing JWT tokens.
- `DATABASE_URL`: PostgreSQL connection string, for example `postgresql://user:password@localhost:5432/skillforge`.
- `GROQ_API_KEY`: Your official API key from Groq Console.
- `CORS_ORIGIN`: Allowed origins for API requests (e.g., `https://your-frontend.vercel.app` or `*`).
- `VITE_API_URL` (Optional): Production URL of the backend API for Vite client reference.

---

## 🚀 Running Locally

### 1. Clone the repository
```bash
git clone https://github.com/your-username/SkillForge-AI.git
cd SkillForge-AI
```

### 2. Backend Setup
Navigate to the `backend` folder, set up a Python virtual environment, install dependencies, and run migrations.

```bash
cd backend
python -m venv venv

# Activate Virtual Environment:
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies:
pip install -r requirements.txt

# Run the backend server:
python run.py
```
The backend server runs locally on **`http://localhost:5000`**.

### 3. Frontend Setup
Navigate to the `frontend` folder, install npm dependencies, and start the development server.

```bash
cd ../frontend
npm install
npm run dev
```
The client dashboard opens on **`http://localhost:5173`**.

---

## 🗄️ Database Design

The relational database uses PostgreSQL under SQLAlchemy management with the following tables:

1. **`users`**: Contains user info (`name`, `email`, encrypted `password`, `created_at`).
2. **`courses`**: Contains generated roadmap courses (`title`, `goal`, `level`, `duration`, `learning_style`, JSON weekly/monthly milestones, relationships to user/modules/quizzes).
3. **`modules`**: Groups lessons (`title`, `order_no`, course relationship).
4. **`lessons`**: Core study modules (`title`, `notes`, `duration`, `video_url`, lists of external links, `completed` flags).
5. **`projects`**: Custom assignments recommended by AI for courses (`title`, `description`, JSON list of technologies).
6. **`resources`**: Useful study links for courses (`title`, `url`).
7. **`user_analytics`**: Stats per user (`xp`, `streak`, total active days, daily progress).
8. **`quizzes`** & **`quiz_attempts`**: Holds dynamic AI quizzes and historical attempt results (`score`, `percentage`, timestamp).
9. **`chat_sessions`** & **`chat_messages`**: Interactive AI Mentor chat logs (`sender`, `content`, reference to course/user).
10. **`bookmarks`**: Keeps track of bookmarked courses and lessons.
11. **`notes`**: Saves inline markdown study notes per lesson.

---

## 📡 API Endpoints

### 🔐 Authentication
- `POST /api/auth/register` - Register a new user.
- `POST /api/auth/login` - Authenticate and retrieve JWT token.

### 📚 Course Operations
- `GET /api/course` - List all generated courses for the logged-in user.
- `POST /api/course` - Generate a new course roadmap via Groq.
- `GET /api/course/<id>` - View detail page including modules and projects.
- `PATCH /api/course/lessons/<id>` - Update lesson attributes (toggle completed, edit note).

### 🤖 AI Mentor Chat
- `GET /api/mentor/chats` - List chat sessions.
- `POST /api/mentor/chats` - Create a new chat session (optionally course-specific).
- `GET /api/mentor/chats/<id>/messages` - Retrieve chat history.
- `POST /api/mentor/chats/<id>/messages` - Send message to Mentor and receive AI response.

### 📝 AI Quiz Generator
- `POST /api/quiz/generate` - Generate a 5-question dynamic quiz for a lesson.
- `POST /api/quiz/submit` - Grade answers, reward XP, save history, return explanations.
- `GET /api/quiz/leaderboard` - Fetch the global XP leaderboard.

### 📊 Analytics & Profile
- `GET /api/profile` - Fetch current user stats (XP, streak, email, name).
- `GET /api/analytics` - Fetch chart-friendly user progress history.

---

## ☁️ Deployment Ready

### Frontend (Vercel)
The React client is fully configured for Vercel. 
1. Push to GitHub.
2. Link the repository to Vercel.
3. Configure the `VITE_API_URL` environment variable to point to your live Render backend URL.
4. Set build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Backend (Render)
The Flask server includes `gunicorn` in `requirements.txt` and is configured for deployment as a Web Service.
1. Create a Web Service on Render.
2. Link the repository.
3. Set Environment variables (`SECRET_KEY`, `JWT_SECRET_KEY`, `GROQ_API_KEY`, `DATABASE_URL`).
4. Set execution parameters:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn run:app`

---

## 🔮 Future Scope

- **Export Roadmaps**: Export your course outline to Google Calendar or download as a formatted PDF.
- **Collaborative Studies**: Share custom generated roadmaps with friends and complete quizzes together.
- **AI Project Grader**: Submit your project code repository for the AI Mentor to grade and provide specific feedback on syntax and styling.
- **Voice Mode**: Speak directly with your AI Mentor for a conversational tutoring session.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](file:///e:/projects/skillforge-ai/LICENSE) for more details.

---

## 🤝 Contributors & Acknowledgements

- Built with ❤️ by the **SkillForge AI** developer community.
- Specialized inference provided by **Groq API** and **Llama 3.3**.
