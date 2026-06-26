import os
import json
import time
from datetime import datetime

# Lazy import groq so it doesn't break if not fully installed yet
def get_groq_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key or api_key == "your_api_key_here":
        return None
    try:
        from groq import Groq
        return Groq(api_key=api_key)
    except Exception as e:
        print("Error initializing Groq client:", str(e))
        return None

# Retry Wrapper
def call_groq_with_retry(prompt, system_prompt=None, json_mode=False, max_retries=3, backoff_in_seconds=1):
    client = get_groq_client()
    if not client:
        raise Exception("Groq API key not set or invalid.")

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    model_name = "llama-3.3-70b-versatile"
    
    for attempt in range(max_retries):
        try:
            kwargs = {
                "model": model_name,
                "messages": messages,
                "temperature": 0.2
            }
            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}

            completion = client.chat.completions.create(**kwargs)
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Groq API call attempt {attempt + 1} failed: {str(e)}")
            if attempt == max_retries - 1:
                raise e
            time.sleep(backoff_in_seconds * (attempt + 1))
    
    raise Exception("Max retries exceeded.")

# Fallback structures
def get_course_fallback(goal, target_role, level, language, duration, daily_time, learning_style):
    goal_lower = goal.lower()
    
    if "react" in goal_lower or "frontend" in goal_lower:
        title = "Professional Frontend Engineering with React & Next.js"
        modules = [
            {
                "title": "Module 1: React 19 Core Elements & Render Cycle",
                "order_no": 1,
                "lessons": [
                    {
                        "title": "JSX, Virtual DOM & React 19 Fiber architecture",
                        "notes": "React 19 introduces significant compiler improvements. Learn about the Fiber reconciliation tree and concurrent rendering capabilities.",
                        "duration": "25 mins",
                        "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                        "resources": ["https://react.dev"],
                        "external_links": ["https://react.dev/blog/2024/04/25/react-19"]
                    },
                    {
                        "title": "State Management Hooks: useState, useReducer, and Context API",
                        "notes": "State lifecycle and propagation. Context API helps avoid prop drilling but should be used selectively to prevent unnecessary renders.",
                        "duration": "30 mins",
                        "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                        "resources": ["https://react.dev/reference/react"],
                        "external_links": []
                    }
                ]
            },
            {
                "title": "Module 2: Server Side Rendering & Next.js App Router",
                "order_no": 2,
                "lessons": [
                    {
                        "title": "Client Components vs Server Components (RSC)",
                        "notes": "Static rendering on the server vs hydration on the client. Best performance optimizations for SEO.",
                        "duration": "35 mins",
                        "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                        "resources": ["https://nextjs.org"],
                        "external_links": []
                    }
                ]
            }
        ]
        outcomes = ["Design responsive React 19 apps", "Master server-side rendering with Next.js"]
        projects = [{
            "title": "SkillForge AI Dashboard Clone",
            "description": "Create a recruiter-ready dashboard with complex analytics and chat contexts using Tailwind CSS.",
            "technologies": ["React", "Vite", "Tailwind CSS", "Recharts"]
        }]
        resources = ["https://react.dev", "https://nextjs.org"]
    else:
        title = f"AI Specialization: {goal.capitalize()} Development"
        modules = [
            {
                "title": f"Module 1: Foundational {goal.capitalize()} Design",
                "order_no": 1,
                "lessons": [
                    {
                        "title": f"Introduction and environment config for {goal}",
                        "notes": f"Set up the dev environment, run hello-world, and overview basic parameters.",
                        "duration": "20 mins",
                        "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                        "resources": [],
                        "external_links": []
                    }
                ]
            }
        ]
        outcomes = [f"Develop production-ready {goal} applications", "Optimize compile and execution times"]
        projects = [{
            "title": f"Enterprise {goal} Platform",
            "description": f"Build a robust platform showcasing advanced paradigms of {goal}.",
            "technologies": [goal, "PostgreSQL"]
        }]
        resources = ["https://google.com"]

    return {
        "title": title,
        "goal": goal,
        "target_role": target_role or "AI Developer",
        "level": level,
        "duration": duration,
        "learning_outcomes": outcomes,
        "projects": projects,
        "resources": resources,
        "modules": modules
    }

def get_quiz_fallback(lesson_title):
    return [
        {
            "id": 1,
            "type": "mcq",
            "question": f"Which of the following describes the core purpose of {lesson_title}?",
            "options": [
                "It serves as a helper styling configuration.",
                "It optimizes resource rendering and execution flow.",
                "It is a temporary database connector.",
                "None of the above."
            ],
            "correct_answer": "It optimizes resource rendering and execution flow.",
            "explanation": "This concept aims to streamline computational load and structure code in a highly efficient, modular format."
        },
        {
            "id": 2,
            "type": "true_false",
            "question": f"True or False: Utilizing {lesson_title} increases state mutations directly.",
            "options": ["True", "False"],
            "correct_answer": "False",
            "explanation": "Direct state mutation is discouraged. Immutability patterns should always be prioritized."
        },
        {
            "id": 3,
            "type": "fill_in_the_blank",
            "question": f"Complete the blank: In modern software architecture, {lesson_title} resolves the issue of ___________ updates.",
            "correct_answer": "optimistic",
            "explanation": "Optimistic updates improve perceived performance by updating layouts prior to server replies."
        }
    ]

def get_mentor_fallback(user_message, course_title=None):
    msg_lower = user_message.lower()
    context_prefix = f"Regarding {course_title}: " if course_title else ""
    
    if "help" in msg_lower or "explain" in msg_lower or "what is" in msg_lower or "how to" in msg_lower:
        return f"""### {context_prefix}Concept Overview

Here is a breakdown of the concept you requested:

1. **Core Concept**: When building robust applications, separating concerns and utilizing modular architecture is key.
2. **Implementation Pattern**:
   ```javascript
   function handleAction(state, action) {{
     switch (action.type) {{
       case 'EXECUTE':
         return {{ ...state, processing: true, timestamp: Date.now() }};
       default:
         return state;
     }}
   }}
   ```
Is there a specific part of this code you want to debug or expand on?"""
    else:
        return f"""Hello! I am your AI Study Mentor. I have loaded your workspace context {f"for **{course_title}**" if course_title else ""}. 

What topic would you like to study next?"""


# Modular AI Service wrapper
class AIService:

    @staticmethod
    def generate_course(goal, target_role, level, language, duration, daily_time, learning_style):
        prompt = f"""
        Generate a structured learning roadmap for:
        Goal: {goal}
        Target Job Role: {target_role}
        Skill Level: {level}
        Language: {language}
        Duration: {duration}
        Daily Time: {daily_time}
        Learning Style: {learning_style}

        You MUST respond with a single JSON object. Do not include markdown wraps (like ```json).
        JSON structure keys MUST be:
        {{
          "title": "Course Title",
          "goal": "Description",
          "target_role": "Target Role Name",
          "duration": "{duration}",
          "level": "{level}",
          "learning_outcomes": ["outcome 1", "outcome 2"],
          "projects": [
            {{
              "title": "Project Title",
              "description": "Details...",
              "technologies": ["tech 1", "tech 2"]
            }}
          ],
          "resources": ["url or text 1"],
          "modules": [
            {{
              "title": "Module Title",
              "order_no": 1,
              "lessons": [
                {{
                  "title": "Lesson Title",
                  "notes": "Detailed explanations in markdown.",
                  "duration": "20 mins",
                  "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                  "resources": ["url 1"],
                  "external_links": ["url 2"]
                }}
              ]
            }}
          ]
        }}
        """
        system_prompt = "You are a professional curriculum builder. You always output valid, clean JSON schemas."
        try:
            res_text = call_groq_with_retry(prompt, system_prompt, json_mode=True)
            return json.loads(res_text.strip())
        except Exception as e:
            print("Failed to generate course roadmap via Groq. Running local fallback.", str(e))
            return get_course_fallback(goal, target_role, level, language, duration, daily_time, learning_style)

    @staticmethod
    def generate_quiz(lesson_title, lesson_notes):
        prompt = f"""
        Generate 3 diagnostic questions based on the lesson below.
        Lesson: {lesson_title}
        Notes: {lesson_notes}

        Output a single JSON object with a single key "questions" containing an array of 3 objects.
        Do not wrap in markdown fences.
        Each question object format:
        {{
          "id": 1,
          "type": "mcq" or "true_false" or "fill_in_the_blank",
          "question": "Question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"], // Only for MCQ or True/False
          "correct_answer": "Option A or exact text word",
          "explanation": "Detailed explanation of correct choice."
        }}
        """
        system_prompt = "You are an automated quiz test builder. You always output valid, structured JSON schemas."
        try:
            res_text = call_groq_with_retry(prompt, system_prompt, json_mode=True)
            data = json.loads(res_text.strip())
            return data.get("questions", data)
        except Exception as e:
            print("Failed to generate quiz via Groq. Running local fallback.", str(e))
            return get_quiz_fallback(lesson_title)

    @staticmethod
    def mentor_chat(user_message, course_title, message_history):
        # Format conversation context
        formatted_messages = []
        if course_title:
            formatted_messages.append(f"System: You are an AI Mentor assisting a student studying the course '{course_title}'. Reference notes where helpful.")
        
        for msg in message_history:
            formatted_messages.append(f"{msg['sender'].capitalize()}: {msg['message']}")
        
        formatted_messages.append(f"User: {user_message}")
        prompt = "\n".join(formatted_messages)
        
        system_prompt = "You are a professional code mentor. You always explain concepts clearly in Markdown formatting, providing code blocks where helpful."
        try:
            return call_groq_with_retry(prompt, system_prompt, json_mode=False)
        except Exception as e:
            print("Failed to get response from Groq Mentor. Running local fallback.", str(e))
            return get_mentor_fallback(user_message, course_title)

    @staticmethod
    def project_recommendation(skill_name, target_role):
        prompt = f"""
        Recommend a resume-worthy portfolio project for:
        Skill: {skill_name}
        Target Role: {target_role}

        Output a single JSON object:
        {{
          "title": "Project Title",
          "difficulty": "Intermediate",
          "description": "Details...",
          "technologies": ["tech1", "tech2"],
          "features": ["feature 1", "feature 2"]
        }}
        """
        try:
            res_text = call_groq_with_retry(prompt, "You are a senior tech project recommender.", json_mode=True)
            return json.loads(res_text.strip())
        except Exception as e:
            return {
                "title": f"Custom {skill_name} Portfolio Platform",
                "difficulty": "Intermediate",
                "description": f"Build a robust platform showcasing modular integrations of {skill_name}.",
                "technologies": [skill_name, "PostgreSQL", "React"],
                "features": ["Modular schemas", "Mock fallback API wrapper", "Dashboard metrics"]
            }

    @staticmethod
    def resume_skill_analysis(skills_list, job_description):
        prompt = f"""
        Analyze the gap between these skills and the job description:
        Skills: {skills_list}
        Job Description: {job_description}

        Output a single JSON object:
        {{
          "match_percentage": 75,
          "matching_skills": ["skill1"],
          "missing_skills": ["skill2"],
          "recommendations": ["actions..."]
        }}
        """
        try:
            res_text = call_groq_with_retry(prompt, "You are an HR technical recruiter analyzer.", json_mode=True)
            return json.loads(res_text.strip())
        except Exception as e:
            return {
                "match_percentage": 65,
                "matching_skills": skills_list[:3] if isinstance(skills_list, list) else [],
                "missing_skills": ["Advanced Cloud Deployments", "Systems level locking"],
                "recommendations": ["Complete a hands-on capstone project", "Review asynchronous execution paradigms"]
            }

    @staticmethod
    def career_guidance(current_level, career_goal):
        prompt = f"""
        Provide career guidance roadmap:
        Current Level: {current_level}
        Career Goal: {career_goal}

        Output a single JSON object:
        {{
          "career_path": "{career_goal}",
          "steps": ["Step 1", "Step 2"],
          "estimated_timeline": "6-12 Months"
        }}
        """
        try:
            res_text = call_groq_with_retry(prompt, "You are a professional tech career coach.", json_mode=True)
            return json.loads(res_text.strip())
        except Exception as e:
            return {
                "career_path": career_goal,
                "steps": [
                    f"Consolidate core foundations from {current_level} difficulty.",
                    "Build at least 2 end-to-end full stack projects.",
                    "Review interview questions and diagnostic checklists."
                ],
                "estimated_timeline": "4-6 Months"
            }
