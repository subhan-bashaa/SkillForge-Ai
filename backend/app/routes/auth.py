from flask import Blueprint, request

from app import db
from app.models.user import User

from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)

import bcrypt


auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)


import logging
from sqlalchemy import exc

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    # Safely log database engine URL (hiding password)
    engine_url = str(db.engine.url)
    safe_url = engine_url
    if "@" in engine_url:
        # e.g., postgresql+psycopg2://user:pass@host/db -> postgresql+psycopg2://user:***@host/db
        prefix = engine_url.split(":")[0] + ":" + engine_url.split(":")[1] + ":***@"
        safe_url = prefix + engine_url.split("@")[1]
    logger.info(f"Database Engine URL: {safe_url}")

    data = request.get_json()
    logger.info("Incoming register request received.")

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    
    if email:
        logger.info(f"Email received: {email}")

    if not all([name, email, password]):
        return {
            "message": "All fields required"
        }, 400

    existing_user = User.query.filter_by(
        email=email
    ).first()

    if existing_user:
        return {
            "message": "Email already exists"
        }, 400

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    user = User(
        name=name,
        email=email,
        password=hashed_password.decode("utf-8")
    )

    db.session.add(user)
    
    try:
        db.session.commit()
        logger.info("db.session.commit() successful.")
    except Exception as e:
        db.session.rollback()
        logger.error(f"db.session.commit() failed: {str(e)}")
        return {
            "message": f"Database commit failed: {str(e)}"
        }, 500

    return {
        "message": "User registered successfully"
    }, 201


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(
        email=email
    ).first()

    if not user:
        return {
            "message": "Invalid credentials"
        }, 401

    if not bcrypt.checkpw(
        password.encode("utf-8"),
        user.password.encode("utf-8")
    ):
        return {
            "message": "Invalid credentials"
        }, 401

    from datetime import datetime
    user.last_login = datetime.utcnow()
    from app import db
    db.session.commit()

    access_token = create_access_token(
        identity=str(user.id)
    )

    return {
        "token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }, 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():

    user_id = get_jwt_identity()

    user = User.query.get(int(user_id))

    if not user:
        return {
            "message": "User not found"
        }, 404

    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }, 200