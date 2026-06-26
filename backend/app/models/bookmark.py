from app import db
from datetime import datetime

class Bookmark(db.Model):
    __tablename__ = "bookmarks"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship("User", back_populates="bookmarks")
    lesson = db.relationship("Lesson")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "lesson_id": self.lesson_id,
            "title": self.title,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "course_id": self.lesson.module.course_id if self.lesson and self.lesson.module else None,
            "lesson_title": self.lesson.title if self.lesson else ""
        }
