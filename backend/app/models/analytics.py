from app import db
import json
from datetime import datetime

class UserAnalytics(db.Model):
    __tablename__ = "user_analytics"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    xp = db.Column(db.Integer, default=0)
    streak = db.Column(db.Integer, default=0)
    badges = db.Column(db.Text, default="[]")  # JSON string of badges, e.g. ["first_steps", "quiz_master"]
    weekly_hours = db.Column(db.Text, default='{"Mon":0,"Tue":0,"Wed":0,"Thu":0,"Fri":0,"Sat":0,"Sun":0}')  # JSON string
    last_active_at = db.Column(db.DateTime, default=datetime.utcnow)
    activity_log = db.Column(db.Text, default="[]")  # JSON string of activity list

    # Relationship
    user = db.relationship("User", back_populates="analytics")

    def get_badges(self):
        try:
            return json.loads(self.badges)
        except Exception:
            return []

    def set_badges(self, value):
        self.badges = json.dumps(value)

    def get_weekly_hours(self):
        try:
            return json.loads(self.weekly_hours)
        except Exception:
            return {"Mon":0,"Tue":0,"Wed":0,"Thu":0,"Fri":0,"Sat":0,"Sun":0}

    def set_weekly_hours(self, value):
        self.weekly_hours = json.dumps(value)

    def get_activity_log(self):
        try:
            return json.loads(self.activity_log)
        except Exception:
            return []

    def set_activity_log(self, value):
        self.activity_log = json.dumps(value)

    def add_activity(self, action, detail):
        logs = self.get_activity_log()
        logs.insert(0, {
            "id": len(logs) + 1,
            "action": action,
            "detail": detail,
            "time": "Just now"
        })
        self.set_activity_log(logs[:15])  # Limit to 15 entries

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "xp": self.xp,
            "streak": self.streak,
            "badges": self.get_badges(),
            "weekly_hours": self.get_weekly_hours(),
            "last_active_at": self.last_active_at.isoformat() if self.last_active_at else None,
            "activity_log": self.get_activity_log()
        }
