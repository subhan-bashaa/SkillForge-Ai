from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
import os
from dotenv import load_dotenv

# Ensure we load the .env file from the backend directory regardless of cwd
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
env_path = os.path.join(backend_dir, '.env')
load_dotenv(dotenv_path=env_path)
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

from app.routes.auth import auth_bp

def create_app():

    app = Flask(__name__)

    app.config.from_object("app.config.Config")

    cors_origin = os.getenv("CORS_ORIGIN", "*")
    CORS(app, resources={r"/api/*": {"origins": cors_origin}})

    db.init_app(app)

    jwt.init_app(app)

    migrate.init_app(app, db, render_as_batch=True)

    # Import blueprints
    from app.routes.auth import auth_bp
    from app.routes.course import course_bp
    from app.routes.analytics import analytics_bp
    from app.routes.mentor import mentor_bp
    from app.routes.quiz import quiz_bp
    from app.routes.profile import profile_bp
    from app.routes.bookmarks import bookmarks_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(course_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(mentor_bp)
    app.register_blueprint(quiz_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(bookmarks_bp)

    # Import models so Flask-Migrate can discover them.
    with app.app_context():
        from app import models

    @app.route("/")
    def home():
        return {
            "message": "SkillForge AI Backend Running"
        }

    return app