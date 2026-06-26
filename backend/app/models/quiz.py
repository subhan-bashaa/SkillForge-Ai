from app import db
import json
from datetime import datetime

class Quiz(db.Model):
    __tablename__ = "quizzes"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id", ondelete="CASCADE"), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    questions = db.Column(db.Text, nullable=False)  # JSON representation of questions list
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    course = db.relationship("Course", back_populates="quizzes")
    lesson = db.relationship("Lesson", back_populates="quizzes")
    attempts = db.relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")

    def get_questions(self):
        try:
            return json.loads(self.questions)
        except Exception:
            return []

    def set_questions(self, value):
        self.questions = json.dumps(value)

    def to_dict(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "lesson_id": self.lesson_id,
            "title": self.title,
            "questions": self.get_questions(),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class QuizAttempt(db.Model):
    __tablename__ = "quiz_attempts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    score = db.Column(db.Float, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship("User", back_populates="quiz_attempts")
    quiz = db.relationship("Quiz", back_populates="attempts")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "quiz_id": self.quiz_id,
            "quiz_title": self.quiz.title if self.quiz else "Quiz",
            "score": self.score,
            "total_questions": self.total_questions,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }
