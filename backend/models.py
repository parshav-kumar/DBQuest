from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    progress = relationship("Progress", back_populates="user")
    scores = relationship("TestScore", back_populates="user")
    badges = relationship("Badge", back_populates="user")

class Progress(Base):
    __tablename__ = "progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic = Column(String, nullable=False)
    level = Column(Integer, nullable=False)
    score = Column(Float, nullable=False)
    passed = Column(Boolean, default=False)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="progress")

class TestScore(Base):
    __tablename__ = "test_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    test_type = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    taken_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="scores")

class Badge(Base):
    __tablename__ = "badges"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    badge_name = Column(String, nullable=False)
    earned_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="badges")