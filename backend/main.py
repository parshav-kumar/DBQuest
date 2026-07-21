from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db, engine
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from datetime import datetime, timedelta
import models
import schemas
import auth
import json
import ai_service

# ── Create all database tables ──
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="DBQuest API")

# ── Rate Limiter ──
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS Middleware ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health Check ──
@app.get("/")
def root():
    return {"message": "DBQuest API is running!"}

# ── Register ──
@app.post("/register", response_model=schemas.UserResponse)
@limiter.limit("5/minute")
def register(request: Request, user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = auth.hash_password(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# ── Login ──
@app.post("/login")
@limiter.limit("10/minute")
def login(request: Request, user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # ── Check if account is locked ──
    if db_user.locked_until and db_user.locked_until > datetime.utcnow():
        remaining = int((db_user.locked_until - datetime.utcnow()).total_seconds() / 60)
        raise HTTPException(
            status_code=403,
            detail=f"Account locked. Try again in {remaining} minute(s)."
        )

    # ── Check password ──
    if not auth.verify_password(user.password, db_user.password):
        db_user.failed_attempts += 1

        if db_user.failed_attempts >= 5:
            db_user.locked_until = datetime.utcnow() + timedelta(minutes=15)
            db_user.failed_attempts = 0
            db.commit()
            raise HTTPException(
                status_code=403,
                detail="Too many failed attempts. Account locked for 15 minutes."
            )

        db.commit()
        raise HTTPException(
            status_code=401,
            detail=f"Invalid email or password. {5 - db_user.failed_attempts} attempts remaining."
        )

    # ── Successful login — reset failed attempts ──
    db_user.failed_attempts = 0
    db_user.locked_until = None
    db.commit()

    token = auth.create_access_token({"sub": db_user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": db_user.username
    }

# ── Save Progress ──
@app.post("/progress", response_model=schemas.ProgressResponse)
def save_progress(progress: schemas.ProgressCreate,
                  db: Session = Depends(get_db),
                  current_user: models.User = Depends(auth.get_current_user)):

    existing = db.query(models.Progress).filter(
        models.Progress.user_id == current_user.id,
        models.Progress.topic == progress.topic,
        models.Progress.level == progress.level
    ).first()

    if existing:
        if progress.score > existing.score:
            existing.score = progress.score
            existing.passed = progress.passed
            db.commit()
            db.refresh(existing)
        return existing
    else:
        new_progress = models.Progress(
            user_id=current_user.id,
            topic=progress.topic,
            level=progress.level,
            score=progress.score,
            passed=progress.passed
        )
        db.add(new_progress)
        db.commit()
        db.refresh(new_progress)
        return new_progress

# ── Get Progress ──
@app.get("/progress")
def get_progress(db: Session = Depends(get_db),
                 current_user: models.User = Depends(auth.get_current_user)):
    progress = db.query(models.Progress).filter(
        models.Progress.user_id == current_user.id
    ).all()
    return progress

# ── Save Test Score ──
@app.post("/scores", response_model=schemas.TestScoreResponse)
def save_score(score: schemas.TestScoreCreate,
               db: Session = Depends(get_db),
               current_user: models.User = Depends(auth.get_current_user)):

    # Check if score already exists for this user + test_type + topic
    existing = db.query(models.TestScore).filter(
        models.TestScore.user_id == current_user.id,
        models.TestScore.test_type == score.test_type,
        models.TestScore.topic == score.topic
    ).first()

    if existing:
        existing.score = score.score
        db.commit()
        db.refresh(existing)
        return existing

    new_score = models.TestScore(
        user_id=current_user.id,
        test_type=score.test_type,
        topic=score.topic,
        score=score.score
    )
    db.add(new_score)
    db.commit()
    db.refresh(new_score)
    return new_score

# ── Get Scores ──
@app.get("/scores")
def get_scores(db: Session = Depends(get_db),
               current_user: models.User = Depends(auth.get_current_user)):
    scores = db.query(models.TestScore).filter(
        models.TestScore.user_id == current_user.id
    ).all()
    return scores

# ── Save Badge ──
@app.post("/badges", response_model=schemas.BadgeResponse)
def save_badge(badge: schemas.BadgeCreate,
               db: Session = Depends(get_db),
               current_user: models.User = Depends(auth.get_current_user)):

    existing = db.query(models.Badge).filter(
        models.Badge.user_id == current_user.id,
        models.Badge.badge_name == badge.badge_name
    ).first()

    if existing:
        return existing

    new_badge = models.Badge(
        user_id=current_user.id,
        badge_name=badge.badge_name
    )
    db.add(new_badge)
    db.commit()
    db.refresh(new_badge)
    return new_badge

# ── Get Badges ──
@app.get("/badges")
def get_badges(db: Session = Depends(get_db),
               current_user: models.User = Depends(auth.get_current_user)):
    badges = db.query(models.Badge).filter(
        models.Badge.user_id == current_user.id
    ).all()
    return badges

# ── Leaderboard ──
@app.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    leaderboard = []
    xp_map = {1: 100, 2: 150, 3: 200}

    for user in users:
        passed_levels = db.query(models.Progress).filter(
            models.Progress.user_id == user.id,
            models.Progress.passed == True
        ).all()

        total_xp = sum(xp_map.get(p.level, 100) for p in passed_levels)
        levels_completed = len(passed_levels)

        leaderboard.append({
            "username": user.username,
            "levels_completed": levels_completed,
            "total_xp": total_xp
        })

    leaderboard.sort(key=lambda x: x["total_xp"], reverse=True)
    return leaderboard

# ── AI Hint ──
@app.post("/ai/hint")
def ai_hint(request: schemas.AIRequest,
            current_user: models.User = Depends(auth.get_current_user)):
    hint = ai_service.get_hint(request.question, request.topic)
    return {"hint": hint}

# ── AI Explanation ──
@app.post("/ai/explain")
def ai_explain(request: schemas.AIRequest,
               current_user: models.User = Depends(auth.get_current_user)):
    explanation = ai_service.get_explanation(
        request.question,
        request.selected_answer,
        request.correct_answer,
        request.topic
    )
    return {"explanation": explanation}

# ── AI SQL Pro Tip ──
@app.post("/ai/protip")
def ai_protip(request: schemas.AIRequest,
              current_user: models.User = Depends(auth.get_current_user)):
    protip = ai_service.get_sql_protip(
        request.selected_answer,
        request.question
    )
    return {"protip": protip}

# ── AI Chat ──
@app.post("/ai/chat")
def ai_chat(request: schemas.AIRequest,
            current_user: models.User = Depends(auth.get_current_user)):
    response = ai_service.get_chat_response(request.question, request.topic)
    return {"response": response}

# ── AI Recommendation ──
@app.post("/ai/recommend")
def ai_recommend(request: schemas.AIRequest,
                 current_user: models.User = Depends(auth.get_current_user)):
    recommendation = ai_service.get_recommendation(
        request.topic,
        float(request.question)
    )
    return {"recommendation": recommendation}

# ── SQL Query Execution ──
@app.post("/quiz/sql/execute")
def execute_sql_query(
    request: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    user_query = request.get("query", "").strip()
    expected_result = request.get("expected_result", [])

    # Security check — only allow SELECT queries
    if not user_query.upper().startswith("SELECT"):
        return {
            "correct": False,
            "result": [],
            "error": "Only SELECT queries are allowed."
        }

    try:
        result = db.execute(text(user_query))
        rows = [dict(row._mapping) for row in result]

        # Smart value cleaner — handles numeric formatting differences
        def clean_value(v):
            if v is None:
                return 'None'
            try:
                f = float(v)
                if f == int(f):
                    return str(int(f))
                return str(round(f, 2))
            except (ValueError, TypeError):
                return str(v)

        # Check if query has ORDER BY
        has_order_by = "ORDER BY" in user_query.upper()

        if has_order_by:
            def normalize_ordered(data):
                return [tuple(clean_value(v) for v in row.values()) for row in data]
            correct = normalize_ordered(rows) == normalize_ordered(expected_result)
        else:
            def normalize_unordered(data):
                return sorted(
                    [tuple(clean_value(v) for v in row.values()) for row in data]
                )
            correct = normalize_unordered(rows) == normalize_unordered(expected_result)

        return {
            "correct": correct,
            "result": rows,
            "error": None,
        }
    except Exception as e:
        return {
            "correct": False,
            "result": [],
            "error": str(e),
        }