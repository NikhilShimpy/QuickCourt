import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

def get_ai_response(user_message):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are RawMate AI, an expert price negotiation assistant."},
                {"role": "user", "content": user_message},
            ]
        )
        return response.choices[0].message['content']
    except Exception as e:
        return f"Error: {str(e)}"
