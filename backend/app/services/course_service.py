from app import db
from app.models.course import Course, Project, Resource
from app.models.module import Module
from app.models.lesson import Lesson
from app.models.analytics import UserAnalytics
from app.services.groq_client import GroqClient
import json

class CourseService:

    @staticmethod
    def get_local_fallback(goal, target_role, level, language, duration, daily_time, learning_style, notes):
        # Premium fallback course structure
        goal_lower = goal.lower()
        
        if "react" in goal_lower or "frontend" in goal_lower:
            title = "Professional React 19 & Next.js Specialization"
            description = "Master modern declarative frontend design, hydration optimizations, and Next.js layout patterns."
            weekly_plan = ["Week 1: Core React 19 Elements", "Week 2: Server-side Rendering & RSC", "Week 3: Next.js App Routing", "Week 4: Production builds & Vercel deployment"]
            monthly_milestones = ["Milestone 1: Deliver responsive React dashboard capstone"]
            interview_questions = [
                "What is the reconciliation reconciliation process in React 19?",
                "How do React 19 transitions differ from traditional state updates?",
                "Describe the difference between server components (RSC) and client components."
            ]
            learning_outcomes = ["Design reactive interfaces", "Configure optimal page loaders", "Handle action states dynamically"]
            
            modules = [
                {
                    "title": "Module 1: React 19 Core Elements & Concurrent Render",
                    "lessons": [
                        {
                            "title": "JSX, Virtual DOM & Fiber scheduling trees",
                            "notes": "React 19 Fiber represents the scheduling loop which breaks rendering into small chunks.",
                            "duration": "25 mins",
                            "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                            "practice_tasks": ["Create a custom reconciler template", "Audit rendering times in Chrome Profiler"],
                            "quiz_topics": ["Virtual DOM diffing", "Fiber priorities"],
                            "resources": ["https://react.dev"],
                            "external_links": []
                        },
                        {
                            "title": "React 19 Action Hooks: useActionState & useTransition",
                            "notes": "Transitions let you update state without blocking the UI thread. useActionState handles pending actions.",
                            "duration": "30 mins",
                            "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                            "practice_tasks": ["Wrap form submission inside useActionState", "Verify loader animation triggers on transition"],
                            "quiz_topics": ["Form Actions", "Pending state hooks"],
                            "resources": ["https://react.dev/reference/react/useActionState"],
                            "external_links": []
                        }
                    ]
                }
            ]
            projects = [{
                "title": "SkillForge AI Dashboard Clone",
                "description": "Build a responsive glassmorphic dashboard tracking student XP metrics.",
                "technologies": ["React", "Vite", "Tailwind CSS", "Recharts"]
            }]
            resources = [{
                "title": "Official React Documentation",
                "url": "https://react.dev"
            }]
        else:
            title = f"Specialization: {goal.capitalize()} Engineering"
            description = f"End-to-end training syllabus covering intermediate to advanced paradigms of {goal}."
            weekly_plan = ["Week 1: Core setup", "Week 2: Advanced structures"]
            monthly_milestones = [f"Milestone 1: Build first production {goal} capstone"]
            interview_questions = [
                f"What are the main execution challenges in {goal}?",
                "Explain memory management patterns."
            ]
            learning_outcomes = [f"Construct scalable applications using {goal}", "Implement diagnostic debugging benchmarks"]
            
            modules = [
                {
                    "title": f"Module 1: Foundational {goal.capitalize()} Design",
                    "lessons": [
                        {
                            "title": f"Environment configurations and hello-world execution",
                            "notes": f"Set up compiler paths and launch first hello-world script.",
                            "duration": "20 mins",
                            "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                            "practice_tasks": ["Install compiler paths", "Verify hello-world outputs"],
                            "quiz_topics": ["Basic compilation options"],
                            "resources": [],
                            "external_links": []
                        }
                    ]
                }
            ]
            projects = [{
                "title": f"Custom {goal.capitalize()} Compiler Platform",
                "description": f"Build a system showcasing standard practices of {goal}.",
                "technologies": [goal, "SQLite"]
            }]
            resources = [{
                "title": f"Search Reference docs",
                "url": "https://google.com"
            }]

        return {
            "title": title,
            "description": description,
            "estimated_time": duration or "4 Weeks",
            "learning_outcomes": learning_outcomes,
            "weekly_plan": weekly_plan,
            "monthly_milestones": monthly_milestones,
            "interview_questions": interview_questions,
            "projects": projects,
            "resources": resources,
            "modules": modules
        }

    @classmethod
    def generate_and_save(cls, user_id, goal, target_role, level, language, duration, daily_time, learning_style, notes):
        # Build prompt for Groq Llama 3.3
        prompt = f"""
        Generate a comprehensive, structured learning roadmap for:
        Goal: {goal}
        Target Role: {target_role}
        Knowledge Level: {level}
        Preferred Language: {language}
        Duration: {duration}
        Daily Time: {daily_time}
        Learning Style: {learning_style}
        Additional Notes: {notes}

        You MUST respond with a single JSON object. Do not wrap in markdown tags (like ```json).
        The JSON object must have this exact structure:
        {{
          "title": "Course Title",
          "description": "Brief description of the course",
          "estimated_time": "{duration}",
          "learning_outcomes": ["outcome 1", "outcome 2"],
          "weekly_plan": ["Week 1: ...", "Week 2: ..."],
          "monthly_milestones": ["Milestone 1: ..."],
          "interview_questions": ["Question 1", "Question 2"],
          "projects": [
            {{
              "title": "Project Title",
              "description": "Details...",
              "technologies": ["tech1", "tech2"]
            }}
          ],
          "resources": [
            {{
              "title": "Resource Name",
              "url": "http://resource.url"
            }}
          ],
          "modules": [
            {{
              "title": "Module Title",
              "lessons": [
                {{
                  "title": "Lesson Title",
                  "notes": "Detailed explanations of the lesson in Markdown format.",
                  "duration": "20 mins",
                  "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                  "practice_tasks": ["task 1", "task 2"],
                  "quiz_topics": ["topic 1"],
                  "resources": ["http://resource1.url"],
                  "external_links": ["http://link.url"]
                }}
              ]
            }}
          ]
        }}
        """
        system_prompt = "You are a professional HR recruiter and curriculum builder. You always respond in valid, structured JSON."
        
        course_data = None
        try:
            res_text = GroqClient.chat_completion(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                json_mode=True
            )
            course_data = json.loads(res_text.strip())
        except Exception as e:
            print("Groq course generation failed, invoking local fallback presets:", str(e))
            course_data = cls.get_local_fallback(goal, target_role, level, language, duration, daily_time, learning_style, notes)

        # Save SQLite transaction
        try:
            # 1. Course Record
            course = Course(
                user_id=user_id,
                title=course_data.get("title", f"AI Specialization: {goal}"),
                goal=goal,
                target_role=target_role or "AI Developer",
                level=level,
                language=language,
                duration=duration,
                daily_time=daily_time,
                learning_style=learning_style,
                difficulty=level,
                description=course_data.get("description", ""),
                estimated_time=course_data.get("estimated_time", duration)
            )
            course.set_learning_outcomes(course_data.get("learning_outcomes", []))
            course.set_weekly_plan(course_data.get("weekly_plan", []))
            course.set_monthly_milestones(course_data.get("monthly_milestones", []))
            course.set_interview_questions(course_data.get("interview_questions", []))
            
            db.session.add(course)
            db.session.flush() # Flush to get course.id

            # 2. Modules & Lessons Records
            for m_idx, m_data in enumerate(course_data.get("modules", [])):
                module = Module(
                    course_id=course.id,
                    title=m_data.get("title", f"Module {m_idx + 1}"),
                    order_no=m_idx + 1
                )
                db.session.add(module)
                db.session.flush()

                for l_idx, l_data in enumerate(m_data.get("lessons", [])):
                    lesson = Lesson(
                        module_id=module.id,
                        title=l_data.get("title", f"Lesson {l_idx + 1}"),
                        completed=False,
                        video_url=l_data.get("video_url", "https://www.youtube.com/embed/dQw4w9WgXcQ"),
                        notes=l_data.get("notes", "Study guide notes are recommended for reference."),
                        duration=l_data.get("duration", "20 mins"),
                        difficulty=level,
                        order_no=l_idx + 1
                    )
                    lesson.set_resources(l_data.get("resources", []))
                    lesson.set_external_links(l_data.get("external_links", []))
                    lesson.set_practice_tasks(l_data.get("practice_tasks", []))
                    lesson.set_quiz_topics(l_data.get("quiz_topics", []))
                    db.session.add(lesson)

            # 3. Normalized Relational Projects
            for p_data in course_data.get("projects", []):
                project = Project(
                    course_id=course.id,
                    title=p_data.get("title", "Capstone Project"),
                    description=p_data.get("description", "A custom learning project."),
                )
                project.set_technologies(p_data.get("technologies", []))
                db.session.add(project)

            # 4. Normalized Relational Resources
            for r_data in course_data.get("resources", []):
                resource = Resource(
                    course_id=course.id,
                    title=r_data.get("title", "Reference Link"),
                    url=r_data.get("url", "https://google.com")
                )
                db.session.add(resource)

            # 5. User Analytics updates
            analytics = UserAnalytics.query.filter_by(user_id=user_id).first()
            if not analytics:
                analytics = UserAnalytics(user_id=user_id)
                db.session.add(analytics)
            analytics.xp += 150
            analytics.add_activity("Generated Roadmap", course.title)

            db.session.commit()
            return course.to_dict()
        except Exception as db_err:
            db.session.rollback()
            print("SQLite Database save failed:", str(db_err))
            raise db_err
