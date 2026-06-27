
import os
from dotenv import load_dotenv
load_dotenv()
from app import create_app, db
from app.models.course import Course
from app.models.user import User

app = create_app()
with app.app_context():
    user = User.query.first()
    if not user:
        user = User(email='test@example.com', password_hash='hash', name='test')
        db.session.add(user)
        db.session.commit()
    
    course = Course(
        user_id=user.id,
        title='Test Course',
        goal='Learn something',
        level='Beginner',
        duration='1 month',
        description='Test description',
        estimated_time='10 hours',
        weekly_plan='[]',
        monthly_milestones='[]',
        interview_questions='[]',
        learning_outcomes='[]',
        prerequisites='[]'
    )
    db.session.add(course)
    db.session.commit()
    print('INSERT INTO courses succeeded!')
