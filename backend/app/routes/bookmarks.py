from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.bookmark import Bookmark
from app.models.note import Note
from app.models.lesson import Lesson

bookmarks_bp = Blueprint("bookmarks", __name__, url_prefix="/api/bookmarks")

@bookmarks_bp.route("", methods=["GET"])
@jwt_required()
def get_bookmarks():
    user_id = int(get_jwt_identity())
    bookmarks = Bookmark.query.filter_by(user_id=user_id).order_by(Bookmark.created_at.desc()).all()
    return jsonify([b.to_dict() for b in bookmarks]), 200

@bookmarks_bp.route("", methods=["POST"])
@jwt_required()
def add_bookmark():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    lesson_id = data.get("lesson_id")
    title = data.get("title")

    if not lesson_id:
        return jsonify({"message": "lesson_id is required"}), 400

    lesson = Lesson.query.get(lesson_id)
    if not lesson or lesson.module.course.user_id != user_id:
        return jsonify({"message": "Lesson not found or unauthorized"}), 404

    # Check duplicate
    existing = Bookmark.query.filter_by(user_id=user_id, lesson_id=lesson_id).first()
    if existing:
        return jsonify(existing.to_dict()), 200

    bookmark = Bookmark(
        user_id=user_id,
        lesson_id=lesson_id,
        title=title or lesson.title
    )
    db.session.add(bookmark)
    db.session.commit()

    return jsonify(bookmark.to_dict()), 201

@bookmarks_bp.route("/<int:bookmark_id>", methods=["DELETE"])
@jwt_required()
def remove_bookmark(bookmark_id):
    user_id = int(get_jwt_identity())
    bookmark = Bookmark.query.filter_by(id=bookmark_id, user_id=user_id).first()
    if not bookmark:
        return jsonify({"message": "Bookmark not found"}), 404

    db.session.delete(bookmark)
    db.session.commit()
    return jsonify({"message": "Bookmark removed"}), 200

# Notes routes are registered under the same blueprint for neat packaging
@bookmarks_bp.route("/notes/<int:lesson_id>", methods=["GET"])
@jwt_required()
def get_note(lesson_id):
    user_id = int(get_jwt_identity())
    note = Note.query.filter_by(user_id=user_id, lesson_id=lesson_id).first()
    if not note:
        return jsonify({"content": ""}), 200
    return jsonify(note.to_dict()), 200

@bookmarks_bp.route("/notes", methods=["POST"])
@jwt_required()
def save_note():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    lesson_id = data.get("lesson_id")
    content = data.get("content")

    if not lesson_id:
        return jsonify({"message": "lesson_id is required"}), 400

    lesson = Lesson.query.get(lesson_id)
    if not lesson or lesson.module.course.user_id != user_id:
        return jsonify({"message": "Lesson not found or unauthorized"}), 404

    note = Note.query.filter_by(user_id=user_id, lesson_id=lesson_id).first()
    if note:
        note.content = content or ""
    else:
        note = Note(
            user_id=user_id,
            lesson_id=lesson_id,
            content=content or ""
        )
        db.session.add(note)

    db.session.commit()
    return jsonify(note.to_dict()), 200
