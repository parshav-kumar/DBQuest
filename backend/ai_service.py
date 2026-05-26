import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# ── AI Hint before answering ──
def get_hint(question: str, topic: str):
    message = client.messages.create(
        model="claude-opus-4-20250514",
        max_tokens=150,
        messages=[
            {
                "role": "user",
                "content": f"You are a helpful database tutor. Give a short hint (2-3 sentences max) to help a student answer this {topic} question without giving away the answer: {question}"
            }
        ]
    )
    return message.content[0].text

# ── AI Explanation after answering ──
def get_explanation(question: str, selected_answer: str, correct_answer: str, topic: str):
    message = client.messages.create(
        model="claude-opus-4-20250514",
        max_tokens=200,
        messages=[
            {
                "role": "user",
                "content": f"You are a helpful database tutor. A student just answered a {topic} question. Question: {question}. Their answer: {selected_answer}. Correct answer: {correct_answer}. Give a clear explanation (3-4 sentences) of why the correct answer is right and what the student should learn from this."
            }
        ]
    )
    return message.content[0].text

# ── DBBot Study Assistant ──
def get_chat_response(user_message: str, topic: str = None):
    system_prompt = "You are DBBot, a friendly and helpful database tutor for a game-based learning platform called DBQuest. You help students understand SQL, ER diagrams, normalisation and functional dependencies. Keep answers clear, concise and encouraging."
    
    if topic:
        system_prompt += f" The student is currently studying {topic}."
    
    message = client.messages.create(
        model="claude-opus-4-20250514",
        max_tokens=300,
        system=system_prompt,
        messages=[
            {
                "role": "user",
                "content": user_message
            }
        ]
    )
    return message.content[0].text

# ── AI Study Recommendation ──
def get_recommendation(topic: str, score: float):
    message = client.messages.create(
        model="claude-opus-4-20250514",
        max_tokens=150,
        messages=[
            {
                "role": "user",
                "content": f"You are a learning advisor for a database learning platform. A student just scored {score}% on a {topic} level. Give a personalised 2-3 sentence study recommendation based on their score."
            }
        ]
    )
    return message.content[0].text