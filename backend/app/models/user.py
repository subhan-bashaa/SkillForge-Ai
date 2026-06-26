from app import db

class User(db.Model):

    __tablename__ = "users"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False
    )

    password = db.Column(
        db.String(255),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

    # Relationships
    analytics = db.relationship("UserAnalytics", back_populates="user", uselist=False, cascade="all, delete-orphan")
    courses = db.relationship("Course", back_populates="user", cascade="all, delete-orphan")
    quiz_attempts = db.relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = db.relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    bookmarks = db.relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")
    notes = db.relationship("Note", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "xp": self.analytics.xp if self.analytics else 0,
            "streak": self.analytics.streak if self.analytics else 0
        }