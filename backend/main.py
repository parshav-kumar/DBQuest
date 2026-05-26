from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, engine
import models
import schemas
import auth
import ai_service

# ── Create all database tables ──
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="DBQuest API")

# ── CORS Middleware ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health Check ──
@app.get("/")
def root():
    return {"message": "DBQuest API is running!"}

# ── Register ──
@app.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
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
@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()
    if not db_user or not auth.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer"}

# ── Save Progress ──
@app.post("/progress", response_model=schemas.ProgressResponse)
def save_progress(progress: schemas.ProgressCreate, 
                  db: Session = Depends(get_db),
                  current_user: models.User = Depends(auth.get_current_user)):
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
    new_score = models.TestScore(
        user_id=current_user.id,
        test_type=score.test_type,
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
    for user in users:
        completed = db.query(models.Progress).filter(
            models.Progress.user_id == user.id,
            models.Progress.passed == True
        ).count()
        leaderboard.append({
            "username": user.username,
            "levels_completed": completed
        })
    leaderboard.sort(key=lambda x: x["levels_completed"], reverse=True)
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