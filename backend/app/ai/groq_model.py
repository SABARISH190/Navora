from groq import Groq
from app.core.config import settings
from app.ai.base_model import AIModel

class GroqModel(AIModel):
    def __init__(self):
        self.client = Groq(api_key=settings.groq_api_key)

    def generate(self, messages: list) -> str:
        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.2,
            response_format={"type": "json_object"},
            stream=False
        )
        return response.choices[0].message.content
