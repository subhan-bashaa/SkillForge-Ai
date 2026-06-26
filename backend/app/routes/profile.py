from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.analytics import UserAnalytics
from app.models.course import Course
import bcrypt
import json

profile_bp = Blueprint("profile", __name__, url_prefix="/api/profile")

@profile_bp.route("", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    analytics = UserAnalytics.query.filter_by(user_id=user_id).first()
    if not analytics:
        analytics = UserAnalytics(user_id=user_id)
        db.session.add(analytics)
        db.session.commit()

    courses = Course.query.filter_by(user_id=user_id).all()
    certificates = []
    
    for c in courses:
        completion_rate = c.to_dict()["completion_rate"]
        if completion_rate >= 100.0:
            import hashlib
            cred_hash = hashlib.md5(f"{user_id}-{c.id}".encode()).hexdigest().upper()[:12]
            certificates.append({
                "id": c.id,
                "course_title": c.title,
                "completed_at": c.created_at.strftime("%B %d, %Y") if c.created_at else "June 2026",
                "credential_id": f"SF-{cred_hash}"
            })

    return jsonify({
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "created_at": user.created_at.isoformat() if user.created_at else None
        },
        "xp": analytics.xp,
        "streak": analytics.streak,
        "badges": analytics.get_badges(),
        "certificates": certificates
    }), 200

@profile_bp.route("", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")

    if not name or not email:
        return jsonify({"message": "Name and email are required"}), 400

    # Check if email is already taken by someone else
    existing = User.query.filter_by(email=email).first()
    if existing and existing.id != user_id:
        return jsonify({"message": "Email is already in use"}), 400

    user.name = name
    user.email = email
    db.session.commit()

    return jsonify({
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }), 200

@profile_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json() or {}
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return jsonify({"message": "Current and new password are required"}), 400

    if not bcrypt.checkpw(current_password.encode("utf-8"), user.password.encode("utf-8")):
        return jsonify({"message": "Incorrect current password"}), 400

    hashed = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())
    user.password = hashed.decode("utf-8")
    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200

@profile_bp.route("/export", methods=["GET"])
@jwt_required()
def export_data():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    courses = Course.query.filter_by(user_id=user_id).all()
    analytics = UserAnalytics.query.filter_by(user_id=user_id).first()

    # Compile a complete export object
    export_payload = {
        "profile": {
            "name": user.name,
            "email": user.email,
            "joined": user.created_at.isoformat() if user.created_at else None
        },
        "statistics": analytics.to_dict() if analytics else {},
        "courses": [c.to_dict() for c in courses]
    }

    return jsonify(export_payload), 200

@profile_bp.route("/account", methods=["DELETE"])
@jwt_required()
def delete_account():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Account successfully deleted"}), 200
