from datetime import datetime
from app import db
from sqlalchemy.dialects.postgresql import ARRAY

class MoodEntry(db.Model):
    """Represents a mood tracking entry"""
    __tablename__ = "mood_entries"
    
    id = db.Column(db.Integer, primary_key=True)
    mood_level = db.Column(db.Integer, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    activities = db.Column(ARRAY(db.String), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.now)
    
    def __repr__(self):
        return f"<MoodEntry id={self.id} mood_level={self.mood_level}>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "mood_level": self.mood_level,
            "notes": self.notes,
            "activities": self.activities,
            "timestamp": self.timestamp
        }

class AssessmentResult(db.Model):
    """Represents the result of a mental health assessment"""
    __tablename__ = "assessment_results"
    
    id = db.Column(db.Integer, primary_key=True)
    assessment_type = db.Column(db.String(100), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    interpretation = db.Column(db.String(100), nullable=False)
    max_score = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now)
    
    def __repr__(self):
        return f"<AssessmentResult id={self.id} type={self.assessment_type} score={self.score}>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "assessment_type": self.assessment_type,
            "score": self.score,
            "interpretation": self.interpretation,
            "max_score": self.max_score,
            "timestamp": self.timestamp
        }

class Resource(db.Model):
    """Represents a mental health resource"""
    __tablename__ = "resources"
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    summary = db.Column(db.Text, nullable=False)
    content = db.Column(db.Text, nullable=False)
    
    def __repr__(self):
        return f"<Resource id={self.id} title={self.title}>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "category": self.category,
            "summary": self.summary,
            "content": self.content
        }
