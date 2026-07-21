from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def get_hint(question: str, topic: str):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{
            "role": "user",
            "content": f"You are a helpful database tutor. Give a short hint (2-3 sentences max) to help a student answer this {topic} question without giving away the answer: {question}"
        }]
    )
    return response.choices[0].message.content


def get_explanation(question: str, selected_answer: str, correct_answer: str, topic: str):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{
            "role": "user",
            "content": f"You are a helpful database tutor. A student answered a {topic} question. Question: {question}. Their answer: {selected_answer}. Correct answer: {correct_answer}. Give a clear 3-4 sentence explanation of why the correct answer is right."
        }]
    )
    return response.choices[0].message.content


def get_sql_protip(query: str, question: str):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{
            "role": "user",
            "content": f"You are a helpful database tutor. A student correctly answered a SQL question by writing this query: {query}. The task was: {question}. Give them ONE interesting pro tip (2-3 sentences) about their query — such as alternative ways to write it, best practices, performance considerations, or real-world usage. Do NOT explain what the query does since they already know. Start with 'Pro tip:'"
        }]
    )
    return response.choices[0].message.content


def get_chat_response(user_message: str, topic: str = None):
    system = (
        "You are DBBot, a friendly database tutor for DBQuest. "
        "You help students understand SQL, ER diagrams, normalisation "
        "and functional dependencies.\n\n"
        "IMPORTANT RULE: You are a tutor, not an answer key. If a student "
        "asks you to directly solve or give the answer to a specific quiz "
        "question, do NOT give the direct answer. Instead, explain the "
        "underlying concept and guide them with a hint or example so they "
        "can work it out for themselves. For general questions like "
        "'what is X' or 'how does Y work', explain clearly with a simple "
        "example. Always keep answers clear, encouraging and in plain English."
    )
    if topic:
        system += f" The student is currently studying {topic}."

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_message}
        ]
    )
    return response.choices[0].message.content


def get_recommendation(topic: str, score: float):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{
            "role": "user",
            "content": f"You are a learning advisor. A student scored {score}% on a {topic} level. Give a personalised 2-3 sentence study recommendation."
        }]
    )
    return response.choices[0].message.content