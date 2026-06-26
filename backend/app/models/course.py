from app import db
import json
from datetime import datetime

class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    technologies = db.Column(db.Text, default="[]")  # JSON list of strings

    course = db.relationship("Course", back_populates="project_relationships")

    def get_technologies(self):
        try:
            return json.loads(self.technologies)
        except Exception:
            return []

    def set_technologies(self, value):
        self.technologies = json.dumps(value)

    def to_dict(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "title": self.title,
            "description": self.description,
            "technologies": self.get_technologies()
        }


class Resource(db.Model):
    __tablename__ = "resources"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    url = db.Column(db.String(255), nullable=False)

    course = db.relationship("Course", back_populates="resource_relationships")

    def to_dict(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "title": self.title,
            "url": self.url
        }


class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    goal = db.Column(db.Text, nullable=False)
    target_role = db.Column(db.String(100), nullable=True)
    level = db.Column(db.String(50), nullable=False)
    language = db.Column(db.String(50), default="English")
    duration = db.Column(db.String(50), nullable=False)
    daily_time = db.Column(db.String(50), default="1 Hour")
    learning_style = db.Column(db.String(50), default="Practical")
    difficulty = db.Column(db.String(50), default="Intermediate")
    
    # Newly added fields
    description = db.Column(db.Text, nullable=True)
    estimated_time = db.Column(db.String(100), nullable=True)
    weekly_plan = db.Column(db.Text, default="[]")  # JSON string
    monthly_milestones = db.Column(db.Text, default="[]")  # JSON string
    interview_questions = db.Column(db.Text, default="[]")  # JSON string
    learning_outcomes = db.Column(db.Text, default="[]")  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship("User", back_populates="courses")
    modules = db.relationship("Module", back_populates="course", cascade="all, delete-orphan", order_by="Module.order_no")
    quizzes = db.relationship("Quiz", back_populates="course", cascade="all, delete-orphan")
    
    # Normalized relationship tables
    project_relationships = db.relationship("Project", back_populates="course", cascade="all, delete-orphan")
    resource_relationships = db.relationship("Resource", back_populates="course", cascade="all, delete-orphan")

    def get_learning_outcomes(self):
        try:
            return json.loads(self.learning_outcomes)
        except Exception:
            return []

    def set_learning_outcomes(self, value):
        self.learning_outcomes = json.dumps(value)

    def get_weekly_plan(self):
        try:
            return json.loads(self.weekly_plan)
        except Exception:
            return []

    def set_weekly_plan(self, value):
        self.weekly_plan = json.dumps(value)

    def get_monthly_milestones(self):
        try:
            return json.loads(self.monthly_milestones)
        except Exception:
            return []

    def set_monthly_milestones(self, value):
        self.monthly_milestones = json.dumps(value)

    def get_interview_questions(self):
        try:
            return json.loads(self.interview_questions)
        except Exception:
            return []

    def set_interview_questions(self, value):
        self.interview_questions = json.dumps(value)

    def to_dict(self):
        # Calculate completion stats
        total_lessons = 0
        completed_lessons = 0
        for m in self.modules:
            for l in m.lessons:
                total_lessons += 1
                if l.completed:
                    completed_lessons += 1

        completion_rate = round((completed_lessons / total_lessons * 100), 1) if total_lessons > 0 else 0.0

        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "goal": self.goal,
            "target_role": self.target_role,
            "level": self.level,
            "language": self.language,
            "duration": self.duration,
            "daily_time": self.daily_time,
            "learning_style": self.learning_style,
            "difficulty": self.difficulty,
            "description": self.description,
            "estimated_time": self.estimated_time or self.duration,
            
            # Map SQL tables to array dictionaries matching old format for compatibility
            "projects": [p.to_dict() for p in self.project_relationships],
            "resources": [r.to_dict() for r in self.resource_relationships],
            
            "learning_outcomes": self.get_learning_outcomes(),
            "weekly_plan": self.get_weekly_plan(),
            "monthly_milestones": self.get_monthly_milestones(),
            "interview_questions": self.get_interview_questions(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "total_modules": len(self.modules),
            "total_lessons": total_lessons,
            "completed_lessons": completed_lessons,
            "completion_rate": completion_rate,
            "modules": [m.to_dict() for m in self.modules]
        }