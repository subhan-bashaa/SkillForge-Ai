from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.mentor import ChatSession, ChatMessage
from app.models.course import Course
from app.models.analytics import UserAnalytics
from app.services.ai_service import AIService

mentor_bp = Blueprint("mentor", __name__, url_prefix="/api/mentor")

@mentor_bp.route("/chats", methods=["GET"])
@jwt_required()
def get_chat_sessions():
    user_id = int(get_jwt_identity())
    sessions = ChatSession.query.filter_by(user_id=user_id).order_by(ChatSession.created_at.desc()).all()
    return jsonify([s.to_dict() for s in sessions]), 200

@mentor_bp.route("/chats", methods=["POST"])
@jwt_required()
def create_chat_session():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    course_id = data.get("course_id")
    
    title = "General Q&A Session"
    if course_id:
        course = Course.query.filter_by(id=course_id, user_id=user_id).first()
        if course:
            title = f"Study: {course.title}"
            
    session = ChatSession(
        user_id=user_id,
        course_id=course_id,
        title=title
    )
    db.session.add(session)
    db.session.commit()
    
    return jsonify(session.to_dict()), 201

@mentor_bp.route("/chats/<int:session_id>/messages", methods=["GET"])
@jwt_required()
def get_session_messages(session_id):
    user_id = int(get_jwt_identity())
    session = ChatSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({"message": "Chat session not found"}), 404
    
    return jsonify([m.to_dict() for m in session.messages]), 200

@mentor_bp.route("/chats/<int:session_id>/message", methods=["POST"])
@jwt_required()
def post_chat_message(session_id):
    user_id = int(get_jwt_identity())
    session = ChatSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({"message": "Chat session not found"}), 404
    
    data = request.get_json() or {}
    user_message = data.get("message")
    if not user_message:
        return jsonify({"message": "Message is required"}), 400

    # Save user message
    user_msg_obj = ChatMessage(
        session_id=session.id,
        sender="user",
        message=user_message
    )
    db.session.add(user_msg_obj)
    db.session.flush()

    # Load history context
    course_title = session.course.title if session.course else None
    prev_msgs = ChatMessage.query.filter_by(session_id=session_id).order_by(ChatMessage.created_at.asc()).all()[-6:]
    history = [{"sender": m.sender, "message": m.message} for m in prev_msgs]

    # Generate reply using Groq/Llama service
    ai_reply = AIService.mentor_chat(
        user_message=user_message,
        course_title=course_title,
        message_history=history
    )

    # Save AI message
    ai_msg_obj = ChatMessage(
        session_id=session.id,
        sender="ai",
        message=ai_reply
    )
    db.session.add(ai_msg_obj)
    
    # Award small XP for engaging with the mentor
    analytics = UserAnalytics.query.filter_by(user_id=user_id).first()
    if analytics:
        analytics.xp += 10
        analytics.add_activity("Asked Mentor", f"Consulted AI about {course_title or 'General Q&A'}")

    db.session.commit()

    return jsonify({
        "user_message": user_msg_obj.to_dict(),
        "ai_message": ai_msg_obj.to_dict(),
        "user_xp": analytics.xp if analytics else 0
    }), 201

@mentor_bp.route("/chats/<int:session_id>", methods=["DELETE"])
@jwt_required()
def delete_chat_session(session_id):
    user_id = int(get_jwt_identity())
    session = ChatSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({"message": "Chat session not found"}), 404
    
    db.session.delete(session)
    db.session.commit()
    return jsonify({"message": "Chat session deleted"}), 200
