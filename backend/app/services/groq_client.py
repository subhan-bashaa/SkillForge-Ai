import os
import time
from groq import Groq

class GroqClient:
    _client = None

    @classmethod
    def get_client(cls):
        if cls._client is None:
            api_key = os.environ.get("GROQ_API_KEY")
            if not api_key or api_key == "your_api_key_here":
                print("Warning: GROQ_API_KEY environment variable is not set correctly.")
                return None
            try:
                cls._client = Groq(api_key=api_key)
            except Exception as e:
                print("Error initializing Groq SDK client:", str(e))
                return None
        return cls._client

    @classmethod
    def chat_completion(cls, messages, model="llama-3.3-70b-versatile", json_mode=False, max_retries=3, backoff=1):
        client = cls.get_client()
        if not client:
            raise Exception("Groq SDK client is not initialized due to missing or invalid GROQ_API_KEY.")

        for attempt in range(max_retries):
            try:
                kwargs = {
                    "model": model,
                    "messages": messages,
                    "temperature": 0.2
                }
                if json_mode:
                    kwargs["response_format"] = {"type": "json_object"}

                completion = client.chat.completions.create(**kwargs)
                return completion.choices[0].message.content
            except Exception as e:
                print(f"Groq API connection error on attempt {attempt + 1}: {str(e)}")
                if attempt == max_retries - 1:
                    raise e
                time.sleep(backoff * (attempt + 1))
        
        raise Exception("Failed to contact Groq API after maximum retries.")
