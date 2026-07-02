# DBQuest 🎮

**A Game-Based Learning Platform for Database Concepts and SQL Practice**

DBQuest is a web-based learning platform that helps computing students learn and practise four core database topics through gamification and AI-powered tutoring. It was developed as part of an MSc Advanced Computer Science with Data Science dissertation at the University of Strathclyde.

---

## 📚 Topics Covered

- **SQL** (Structured Query Language) — real query execution against a live PostgreSQL database
- **Entity-Relationship (ER) Diagrams**
- **Database Normalisation** (1NF, 2NF, 3NF)
- **Functional Dependencies**

Each topic has 3 progressive levels. Students must score at least 60% on a level to unlock the next.

---

## ✨ Features

### Gamification
- Experience points (XP) with weighted scoring per level
- Badges and achievements
- Leaderboard ranked by weighted XP
- Progressive level-locking system

### AI-Powered Learning (via Groq / Llama 3.3)
- **AI Hint** — a nudge in the right direction before answering (never gives the answer away)
- **AI Explanation** — a clear explanation after each answer
- **SQL Pro Tip** — best-practice tips after a correct SQL query
- **DBBot** — a floating chatbot tutor that answers database questions but is designed to teach concepts, not hand out quiz answers
- **AI Study Recommendation** — personalised guidance on the results screen

### Learning Measurement
- Pre-test and post-test per topic to measure learning gain
- Results comparison showing improvement

### Other
- Secure authentication (JWT, bcrypt, rate limiting, account lockout)
- Dark / light theme
- Fully scenario-based question bank

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS v4 + React Router + Axios |
| Backend | Python + FastAPI + SQLAlchemy |
| Database | PostgreSQL |
| AI | Groq API (llama-3.3-70b-versatile) |
| Auth | JWT + bcrypt |

---

## 🚀 Getting Started

### Prerequisites
- Node.js and npm
- Python 3.10+
- PostgreSQL installed and running

### 1. Clone the repository
```bash
git clone ssh://git@gitlab.cis.strath.ac.uk:2222/srb25235/dbquest.git
cd dbquest
```

### 2. Backend setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder with the following:
```
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=postgresql://your_username@localhost/dbquest
SECRET_KEY=your_jwt_secret_key_here
```

Make sure the `dbquest` database exists in PostgreSQL, then start the backend:
```bash
uvicorn main:app --reload
```
The backend runs on **http://localhost:8000**

### 3. Frontend setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The frontend runs on **http://localhost:5175**

---

## 📁 Project Structure

```
dbquest/
├── frontend/              # React + Vite application
│   ├── src/
│   │   ├── components/    # Navbar, DBBot, etc.
│   │   ├── pages/         # Dashboard, QuizPage, Leaderboard, etc.
│   │   ├── context/       # ThemeContext
│   │   └── App.jsx
│   └── package.json
│
├── backend/              # FastAPI application
│   ├── main.py           # All API routes
│   ├── models.py         # Database table definitions
│   ├── schemas.py        # Request/response validation
│   ├── auth.py           # JWT authentication
│   ├── ai_service.py     # Groq AI feature functions
│   └── requirements.txt
│
└── README.md
```

---

## 🔒 Security Notes

- API keys and secrets are stored in `.env` files, which are excluded from version control via `.gitignore`.
- Passwords are hashed with bcrypt and never stored in plain text.
- Protected routes require a valid JWT token.

---

## 📖 Academic Context

DBQuest was built to investigate three research questions:

1. **RQ1** — Does DBQuest improve student understanding? (measured via pre/post-test learning gain)
2. **RQ2** — Does gamification increase engagement? (measured via questionnaire)
3. **RQ3** — Do AI features support learning? (measured via questionnaire)

---

## 👤 Author

**Parshav Kumar**
MSc Advanced Computer Science with Data Science
University of Strathclyde
Supervisor: Dr Muhammad Irfan
