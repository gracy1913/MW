import os
import logging
from flask import Flask
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create the base class for SQLAlchemy models
class Base(DeclarativeBase):
    pass

# Initialize SQLAlchemy
db = SQLAlchemy(model_class=Base)

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default-dev-key")

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize the app with the extension
db.init_app(app)

# Database utility functions
def add_mood_entry(mood_data):
    """Add a mood entry to the database"""
    from models import MoodEntry
    
    new_entry = MoodEntry(
        mood_level=mood_data.get("mood_level"),
        notes=mood_data.get("notes"),
        activities=mood_data.get("activities")
    )
    
    db.session.add(new_entry)
    db.session.commit()
    return new_entry.id

def get_mood_entries(limit=30):
    """Get most recent mood entries, limited to a specific amount"""
    from models import MoodEntry
    
    entries = MoodEntry.query.order_by(MoodEntry.timestamp.desc()).limit(limit).all()
    return [entry.to_dict() for entry in entries]

def add_assessment_result(result_data):
    """Add an assessment result to the database"""
    from models import AssessmentResult
    
    new_result = AssessmentResult(
        assessment_type=result_data.get("assessment_type"),
        score=result_data.get("score"),
        interpretation=result_data.get("interpretation"),
        max_score=result_data.get("max_score")
    )
    
    db.session.add(new_result)
    db.session.commit()
    return new_result.id

def get_assessment_results(limit=10):
    """Get most recent assessment results"""
    from models import AssessmentResult
    
    results = AssessmentResult.query.order_by(AssessmentResult.timestamp.desc()).limit(limit).all()
    return [result.to_dict() for result in results]

def get_resources(category=None):
    """Get wellness resources, optionally filtered by category"""
    from models import Resource
    
    if category:
        resources = Resource.query.filter_by(category=category).all()
    else:
        resources = Resource.query.all()
    
    return [resource.to_dict() for resource in resources]

def get_resource(resource_id):
    """Get a specific resource by ID"""
    from models import Resource
    
    resource = Resource.query.get(resource_id)
    return resource.to_dict() if resource else None

# Initialize the database and create initial resources
def init_db():
    with app.app_context():
        # Import models
        from models import Resource, MoodEntry, AssessmentResult
        
        # Create tables
        db.create_all()
        
        # Check if resources already exist
        if Resource.query.count() == 0:
            # Add initial resources
            initial_resources = [
                Resource(
                    title="Understanding Anxiety",
                    category="Anxiety",
                    summary="Learn about anxiety disorders, symptoms, and coping strategies in the Indian context.",
                    content="Anxiety is a normal and often healthy emotion. However, when a person regularly feels disproportionate levels of anxiety, it might become a medical disorder. In India, anxiety disorders affect approximately 3.5 crore people, yet remain largely undertreated due to stigma. Common cultural expressions include physical symptoms (like headaches, palpitations) rather than psychological complaints. Traditional practices like yoga and meditation are often used alongside modern treatments."
                ),
                Resource(
                    title="Managing Depression",
                    category="Depression",
                    summary="Practical strategies for managing depression symptoms in an Indian context.",
                    content="Depression is a serious medical condition that affects how you feel, think, and handle daily activities. In India, over 5.6 crore people suffer from depression, with particular vulnerability among youth and women. Cultural factors sometimes mask depression as physical ailments or family conflicts. Treatment approaches in India often combine medical care with community support, family involvement, and sometimes traditional Ayurvedic practices that focus on mind-body balance."
                ),
                Resource(
                    title="Stress Reduction Techniques",
                    category="Stress Management",
                    summary="Evidence-based approaches for reducing stress with Indian wellness traditions.",
                    content="Stress is your body's way of responding to demands or pressure. In the Indian context, traditional stress management includes practices like pranayama (breathing exercises), yoga, and meditation—which have been scientifically validated worldwide. Mindfulness practices derived from ancient Indian traditions can help manage the unique stressors of modern Indian life, including work pressure, family responsibilities, and social expectations. Many Indians also find stress relief through community engagement and spiritual practices."
                ),
                Resource(
                    title="Mental Health Resources in India",
                    category="Support Services",
                    summary="Guide to mental health support services available across India.",
                    content="India has seen significant growth in mental health services in recent years. The National Mental Health Program provides services through district hospitals and community health centers. Organizations like NIMHANS (National Institute of Mental Health and Neurosciences) in Bangalore, AIIMS in Delhi, and PGI Chandigarh offer specialized care. Helplines include NIMHANS's toll-free number (080-26995000) and Aasra (022-27546669). Online platforms like Practo and Mfine connect patients with mental health professionals. Many NGOs like The Live Love Laugh Foundation and SCARF also provide support services and work to reduce stigma around mental health issues."
                ),
                Resource(
                    title="Family Dynamics and Mental Health",
                    category="Relationships",
                    summary="Understanding the role of family in mental wellbeing in Indian society.",
                    content="In India, family plays a central role in both mental health challenges and recovery. The closely-knit family structure can provide strong support systems but may also contribute to stress through expectations and obligations. Multi-generational households present unique dynamics that influence how mental health issues are perceived and addressed. Open communication within families about mental health remains challenging due to stigma, but family-based interventions have shown great success in Indian contexts. Research shows that including family members in treatment plans increases effectiveness for many mental health conditions in India."
                )
            ]
            
            for resource in initial_resources:
                db.session.add(resource)
            
            db.session.commit()
            logger.info("Added initial resources to the database")
        else:
            logger.info("Resources already exist in the database")

# Initialize the database
init_db()

logger.info("Application initialized")
