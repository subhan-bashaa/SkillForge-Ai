from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.course import Course, Project, Resource
from app.models.module import Module
from app.models.lesson import Lesson
from app.models.analytics import UserAnalytics
from app.services.course_service import CourseService
from datetime import datetime

# Blueprint URL registered to /api/course (singular)
course_bp = Blueprint("courses", __name__, url_prefix="/api/course")

@course_bp.route("/generate", methods=["POST"])
@jwt_required()
def generate_course():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    
    goal = data.get("goal")
    target_role = data.get("target_role") or data.get("role")
    level = data.get("level") or data.get("difficulty") or "Intermediate"
    language = data.get("language") or "English"
    duration = data.get("duration") or "4 Weeks"
    daily_time = data.get("daily_time") or data.get("daily_hours") or "1 Hour"
    learning_style = data.get("learning_style") or "Practical"
    notes = data.get("notes") or ""
    
    if not goal:
        return jsonify({"message": "Goal is required"}), 400

    try:
        course_dict = CourseService.generate_and_save(
            user_id=user_id,
            goal=goal,
            target_role=target_role,
            level=level,
            language=language,
            duration=duration,
            daily_time=daily_time,
            learning_style=learning_style,
            notes=notes
        )
        return jsonify(course_dict), 201
    except Exception as e:
        return jsonify({"message": "Failed to create roadmap", "details": str(e)}), 500

@course_bp.route("", methods=["GET"])
@jwt_required()
def get_courses():
    user_id = int(get_jwt_identity())
    
    search = request.args.get("search", "")
    level_filter = request.args.get("level", "")
    sort_by = request.args.get("sort", "newest")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 8))

    query = Course.query.filter_by(user_id=user_id)

    if search:
        query = query.filter(Course.title.ilike(f"%{search}%"))
    
    if level_filter:
        query = query.filter(Course.level == level_filter)

    courses_list = query.all()
    
    if sort_by == "oldest":
        courses_list.sort(key=lambda c: c.created_at)
    elif sort_by == "progress":
        courses_list.sort(key=lambda c: c.to_dict()["completion_rate"], reverse=True)
    else: # newest
        courses_list.sort(key=lambda c: c.created_at, reverse=True)

    total = len(courses_list)
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    paginated_courses = courses_list[start_idx:end_idx]

    return jsonify({
        "courses": [c.to_dict() for c in paginated_courses],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page
    }), 200

@course_bp.route("/<int:course_id>", methods=["GET"])
@jwt_required()
def get_course_details(course_id):
    user_id = int(get_jwt_identity())
    course = Course.query.filter_by(id=course_id, user_id=user_id).first()
    if not course:
        return jsonify({"message": "Course not found"}), 404
    return jsonify(course.to_dict()), 200

@course_bp.route("/<int:course_id>", methods=["PUT"])
@jwt_required()
def edit_course(course_id):
    user_id = int(get_jwt_identity())
    course = Course.query.filter_by(id=course_id, user_id=user_id).first()
    if not course:
        return jsonify({"message": "Course not found"}), 404
    
    data = request.get_json()
    course.title = data.get("title", course.title)
    db.session.commit()
    return jsonify(course.to_dict()), 200

@course_bp.route("/<int:course_id>", methods=["DELETE"])
@jwt_required()
def delete_course(course_id):
    user_id = int(get_jwt_identity())
    course = Course.query.filter_by(id=course_id, user_id=user_id).first()
    if not course:
        return jsonify({"message": "Course not found"}), 404
    
    db.session.delete(course)
    db.session.commit()
    return jsonify({"message": "Course deleted successfully"}), 200

@course_bp.route("/<int:course_id>/duplicate", methods=["POST"])
@jwt_required()
def duplicate_course(course_id):
    user_id = int(get_jwt_identity())
    course = Course.query.filter_by(id=course_id, user_id=user_id).first()
    if not course:
        return jsonify({"message": "Course not found"}), 404

    try:
        new_course = Course(
            user_id=user_id,
            title=f"Copy of {course.title}",
            goal=course.goal,
            target_role=course.target_role,
            level=course.level,
            language=course.language,
            duration=course.duration,
            daily_time=course.daily_time,
            learning_style=course.learning_style,
            difficulty=course.difficulty,
            description=course.description,
            estimated_time=course.estimated_time,
            learning_outcomes=course.learning_outcomes,
            weekly_plan=course.weekly_plan,
            monthly_milestones=course.monthly_milestones,
            interview_questions=course.interview_questions
        )
        db.session.add(new_course)
        db.session.flush()

        for m in course.modules:
            new_module = Module(
                course_id=new_course.id,
                title=m.title,
                order_no=m.order_no
            )
            db.session.add(new_module)
            db.session.flush()

            for l in m.lessons:
                new_lesson = Lesson(
                    module_id=new_module.id,
                    title=l.title,
                    completed=False,
                    video_url=l.video_url,
                    notes=l.notes,
                    duration=l.duration,
                    difficulty=l.difficulty,
                    order_no=l.order_no,
                    resources=l.resources,
                    external_links=l.external_links,
                    practice_tasks=l.practice_tasks,
                    quiz_topics=l.quiz_topics
                )
                db.session.add(new_lesson)

        for proj in course.project_relationships:
            new_proj = Project(
                course_id=new_course.id,
                title=proj.title,
                description=proj.description,
                technologies=proj.technologies
            )
            db.session.add(new_proj)

        for res in course.resource_relationships:
            new_res = Resource(
                course_id=new_course.id,
                title=res.title,
                url=res.url
            )
            db.session.add(new_res)

        analytics = UserAnalytics.query.filter_by(user_id=user_id).first()
        if analytics:
            analytics.add_activity("Duplicated Roadmap", course.title)

        db.session.commit()
        return jsonify(new_course.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Duplication failed", "details": str(e)}), 500

@course_bp.route("/lessons/<int:lesson_id>/complete", methods=["PATCH"])
@jwt_required()
def toggle_lesson_completion(lesson_id):
    user_id = int(get_jwt_identity())
    lesson = Lesson.query.get(lesson_id)
    if not lesson or lesson.module.course.user_id != user_id:
        return jsonify({"message": "Lesson not found"}), 404

    data = request.get_json() or {}
    completed = data.get("completed", not lesson.completed)
    
    if lesson.completed != completed:
        lesson.completed = completed
        
        analytics = UserAnalytics.query.filter_by(user_id=user_id).first()
        if not analytics:
            analytics = UserAnalytics(user_id=user_id)
            db.session.add(analytics)
        
        xp_gain = 50 if completed else -50
        analytics.xp = max(0, analytics.xp + xp_gain)
        
        if completed:
            analytics.add_activity("Completed Lesson", f"{lesson.title} ({lesson.module.course.title})")
        else:
            analytics.add_activity("Reset Lesson", f"{lesson.title} ({lesson.module.course.title})")

        weekly = analytics.get_weekly_hours()
        current_day = datetime.now().strftime("%a")
        if current_day in weekly:
            weekly[current_day] = round(weekly[current_day] + (0.3 if completed else -0.3), 1)
            weekly[current_day] = max(0, weekly[current_day])
            analytics.set_weekly_hours(weekly)
        
        analytics.streak = max(1, analytics.streak)
        analytics.last_active_at = datetime.utcnow()
        
        db.session.commit()

    return jsonify({
        "lesson_id": lesson.id,
        "completed": lesson.completed,
        "course_progress": lesson.module.course.to_dict()["completion_rate"],
        "user_xp": analytics.xp if 'analytics' in locals() else 0
    }), 200

@course_bp.route("/lesson/<int:lesson_id>/content", methods=["GET"])
@jwt_required()
def generate_lesson_content(lesson_id):
    user_id = int(get_jwt_identity())
    try:
        lesson_data = CourseService.generate_lesson_content(lesson_id, user_id)
        return jsonify(lesson_data), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500
