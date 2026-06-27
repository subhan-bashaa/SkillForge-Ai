from app import db
import json

class Lesson(db.Model):
    __tablename__ = "lessons"

    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    video_url = db.Column(db.String(255), default="")
    notes = db.Column(db.Text, default="")
    resources = db.Column(db.Text, default="[]")  # JSON string
    external_links = db.Column(db.Text, default="[]")  # JSON string
    duration = db.Column(db.String(50), default="20 mins")
    difficulty = db.Column(db.String(50), default="Intermediate")
    order_no = db.Column(db.Integer, default=1, nullable=False)
    
    # Newly added fields
    practice_tasks = db.Column(db.Text, default="[]")  # JSON string
    quiz_topics = db.Column(db.Text, default="[]")  # JSON string

    # Relationships
    module = db.relationship("Module", back_populates="lessons")
    quiz_attempts = db.relationship("QuizAttempt", back_populates="lesson", cascade="all, delete-orphan")

    def get_resources(self):
        try:
            return json.loads(self.resources)
        except Exception:
            return []

    def set_resources(self, value):
        self.resources = json.dumps(value)

    def get_external_links(self):
        try:
            return json.loads(self.external_links)
        except Exception:
            return []

    def set_external_links(self, value):
        self.external_links = json.dumps(value)

    def get_practice_tasks(self):
        try:
            return json.loads(self.practice_tasks)
        except Exception:
            return []

    def set_practice_tasks(self, value):
        self.practice_tasks = json.dumps(value)

    def get_quiz_topics(self):
        try:
            return json.loads(self.quiz_topics)
        except Exception:
            return []

    def set_quiz_topics(self, value):
        self.quiz_topics = json.dumps(value)

    def to_dict(self):
        return {
            "id": self.id,
            "module_id": self.module_id,
            "title": self.title,
            "completed": self.completed,
            "video_url": self.video_url,
            "notes": self.notes,
            "resources": self.get_resources(),
            "external_links": self.get_external_links(),
            "duration": self.duration,
            "difficulty": self.difficulty,
            "order_no": self.order_no,
            "practice_tasks": self.get_practice_tasks(),
            "quiz_topics": self.get_quiz_topics(),
            "course_id": self.module.course_id if self.module else None
        }