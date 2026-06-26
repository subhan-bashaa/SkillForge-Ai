from app import db

class Module(db.Model):
    __tablename__ = "modules"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    order_no = db.Column(db.Integer, nullable=False)

    # Relationships
    course = db.relationship("Course", back_populates="modules")
    lessons = db.relationship("Lesson", back_populates="module", cascade="all, delete-orphan", order_by="Lesson.order_no")

    def to_dict(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "title": self.title,
            "order_no": self.order_no,
            "lessons": [l.to_dict() for l in self.lessons]
        }