import os
from dotenv import load_dotenv
load_dotenv()

from app import create_app, db
from app.services.course_service import CourseService
from app.models.user import User

app = create_app()
with app.app_context():
    print(f"DATABASE_URL: {os.getenv('DATABASE_URL')}")
    user = User.query.first()
    if not user:
        print("No user found!")
    else:
        print(f"Testing generation for user {user.id}")
        try:
            res = CourseService.generate_and_save(
                user_id=user.id,
                goal="Test Goal",
                target_role="Tester",
                level="Beginner",
                language="English",
                duration="1 Week",
                daily_time="1 Hour",
                learning_style="Practical",
                notes=""
            )
            print("SUCCESS")
        except Exception as e:
            import traceback
            traceback.print_exc()
