from app import db
from datetime import datetime

class QuizAttempt(db.Model):
    __tablename__ = "quiz_attempts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    
    score = db.Column(db.Float, nullable=False)
    percentage = db.Column(db.Float, nullable=False)
    correct_answers = db.Column(db.Integer, nullable=False)
    wrong_answers = db.Column(db.Integer, nullable=False)
    
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship("User", back_populates="quiz_attempts")
    lesson = db.relationship("Lesson", back_populates="quiz_attempts")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "lesson_id": self.lesson_id,
            "score": self.score,
            "percentage": self.percentage,
            "correct_answers": self.correct_answers,
            "wrong_answers": self.wrong_answers,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }
