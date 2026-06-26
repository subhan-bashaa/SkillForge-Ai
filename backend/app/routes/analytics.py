from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.analytics import UserAnalytics
from app.models.course import Course
from app.models.quiz import QuizAttempt
from app import db
from datetime import datetime, timedelta

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")

@analytics_bp.route("", methods=["GET"])
@jwt_required()
def get_user_analytics():
    user_id = int(get_jwt_identity())
    
    # Get or create user analytics
    analytics = UserAnalytics.query.filter_by(user_id=user_id).first()
    if not analytics:
        analytics = UserAnalytics(user_id=user_id)
        db.session.add(analytics)
        db.session.commit()
    
    # Refresh/verify streak
    # If the last activity was more than 48 hours ago, reset streak
    if analytics.last_active_at and datetime.utcnow() - analytics.last_active_at > timedelta(days=2):
        analytics.streak = 0
        db.session.commit()
    elif analytics.streak == 0:
        # Give them at least a 1 streak if they have ever generated a course
        courses_count = Course.query.filter_by(user_id=user_id).count()
        if courses_count > 0:
            analytics.streak = 1
            db.session.commit()

    # Calculate active paths, completed modules, completed lessons
    courses = Course.query.filter_by(user_id=user_id).all()
    total_lessons = 0
    completed_lessons = 0
    completed_modules = 0

    for c in courses:
        for m in c.modules:
            module_completed = True
            for l in m.lessons:
                total_lessons += 1
                if l.completed:
                    completed_lessons += 1
                else:
                    module_completed = False
            if len(m.lessons) > 0 and module_completed:
                completed_modules += 1

    # Fetch quiz attempts count
    quiz_attempts_count = QuizAttempt.query.filter_by(user_id=user_id).count()
    
    # Dynamic Productivity Score out of 100
    # Formula: (completed_lessons * 15 + streak * 5 + xp / 100) bounded between 10 and 100
    productivity_score = min(100, max(15, (completed_lessons * 8) + (analytics.streak * 4) + int(analytics.xp / 150)))

    # Heatmap activity calendar (dates of active studies in the last 30 days)
    # Generate list of past 30 days with study levels
    today = datetime.now()
    heatmap = {}
    for i in range(30):
        day_date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        # Give some mock variability linked to lesson completion times
        heatmap[day_date] = 0
    
    # We can mark active days based on recent logs
    activity_log = analytics.get_activity_log()
    for log in activity_log:
        # If it says 'Just now' or 'hours ago', it's today
        if 'now' in log["time"] or 'hours' in log["time"] or 'mins' in log["time"]:
            heatmap[today.strftime("%Y-%m-%d")] = 3
        elif 'Yesterday' in log["time"]:
            yesterday = (today - timedelta(days=1)).strftime("%Y-%m-%d")
            heatmap[yesterday] = 2

    # Map heatmap to list format
    heatmap_list = [{"date": k, "count": v} for k, v in heatmap.items()]
    heatmap_list.reverse() # chronologically ascending

    # Achievements badge assessment
    badges = analytics.get_badges()
    badges_to_award = []
    
    # First course generated badge
    if len(courses) > 0 and "course_starter" not in badges:
        badges_to_award.append({
            "id": "course_starter",
            "name": "Syllabus Forge",
            "description": "Generated your first custom roadmap.",
            "icon": "FiZap",
            "color": "from-amber-500 to-orange-500"
        })
    
    # First lesson completed badge
    if completed_lessons > 0 and "first_lesson" not in badges:
        badges_to_award.append({
            "id": "first_lesson",
            "name": "First Milestone",
            "description": "Completed your first lesson module.",
            "icon": "FiCheckCircle",
            "color": "from-indigo-500 to-purple-500"
        })
    
    # 5 lessons completed
    if completed_lessons >= 5 and "lesson_marathoner" not in badges:
        badges_to_award.append({
            "id": "lesson_marathoner",
            "name": "Knowledge Collector",
            "description": "Completed 5 lessons in any path.",
            "icon": "FiBookOpen",
            "color": "from-cyan-500 to-blue-500"
        })

    # Quiz attempt
    if quiz_attempts_count > 0 and "quiz_taker" not in badges:
        badges_to_award.append({
            "id": "quiz_taker",
            "name": "Quiz Cadet",
            "description": "Attempted your first AI generated quiz.",
            "icon": "FiAward",
            "color": "from-emerald-500 to-teal-500"
        })

    # Save newly awarded badges
    if badges_to_award:
        current_badges = badges
        for b in badges_to_award:
            if b["id"] not in [x.get("id") if isinstance(x, dict) else x for x in current_badges]:
                current_badges.append(b)
        analytics.set_badges(current_badges)
        db.session.commit()

    return jsonify({
        "xp": analytics.xp,
        "streak": analytics.streak,
        "weekly_hours": analytics.get_weekly_hours(),
        "activity_log": analytics.get_activity_log(),
        "active_paths": len(courses),
        "completed_modules": completed_modules,
        "completed_lessons": completed_lessons,
        "total_lessons": total_lessons,
        "quiz_attempts": quiz_attempts_count,
        "productivity_score": productivity_score,
        "heatmap": heatmap_list,
        "badges": analytics.get_badges()
    }), 200
