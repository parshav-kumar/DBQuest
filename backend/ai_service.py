from groq import Groq
import os
import re
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def get_hint(question: str, topic: str):
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{
            "role": "user",
            "content": f"You are a helpful database tutor. Give a short hint (2-3 sentences max) to help a student answer this {topic} question without giving away the answer: {question}"
        }]
    )
    return response.choices[0].message.content


def get_explanation(question: str, selected_answer: str, correct_answer: str, topic: str):
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{
            "role": "user",
            "content": f"You are a helpful database tutor. A student answered a {topic} question. Question: {question}. Their answer: {selected_answer}. Correct answer: {correct_answer}. Give a clear 3-4 sentence explanation of why the correct answer is right."
        }]
    )
    return response.choices[0].message.content


def get_sql_protip(query: str, question: str):
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{
            "role": "user",
            "content": f"You are a helpful database tutor. A student correctly answered a SQL question by writing this query: {query}. The task was: {question}. Give them ONE interesting pro tip (2-3 sentences) about their query — such as alternative ways to write it, best practices, performance considerations, or real-world usage. Do NOT explain what the query does since they already know. Start with 'Pro tip:'"
        }]
    )
    return response.choices[0].message.content


def is_quiz_question(text: str) -> bool:
    """
    Detects whether a message is a multiple-choice quiz question.

    Looks for three or more lettered answer options, e.g. "A)" "B)" "C)" "D)"
    or "A." "B." "C." "D.". Three is used as the threshold so that ordinary
    sentences containing a stray letter and bracket are not misidentified.
    """
    options_found = re.findall(r'\b[A-Da-d][\)\.]\s', text)
    return len(options_found) >= 3


def get_chat_response(user_message: str, topic: str = None):
    system = (
        "You are DBBot, a friendly database tutor for DBQuest. "
        "You help students understand SQL, ER diagrams, normalisation "
        "and functional dependencies.\n\n"

        "CRITICAL RULE: NEVER REVEAL QUIZ ANSWERS:\n"
        "If a message contains lettered or numbered answer options "
        "(for example 'A)', 'B)', 'C)', 'D)'), it is a quiz question. "
        "You must NOT state which option is correct, and must NOT name "
        "the correct term as the answer.\n\n"

        "For quiz questions you must:\n"
        "- Explain the underlying CONCEPT being tested\n"
        "- Describe what each option does in general terms\n"
        "- End by asking the student which option they think fits, and why\n"
        "- NEVER write phrases like 'the answer is', 'the correct option is', "
        "'this is the one you want', or restate one option as correct\n\n"

        "For genuine learning questions with no answer options "
        "(for example 'what is a foreign key?'), answer fully and clearly "
        "with an example. Be helpful — do not refuse ordinary questions.\n\n"

        "Always keep answers clear, encouraging and in plain English."
    )

    if topic:
        system += f" The student is currently studying {topic}."

    # Code-level safeguard: if the message is detected as a multiple-choice
    # quiz question, append a stronger constraint for this request only.
    if is_quiz_question(user_message):
        system += (
            "\n\nIMPORTANT: The student's message IS a multiple-choice quiz "
            "question. You are FORBIDDEN from identifying the correct option. "
            "Do not name it, do not hint at which one it is, and do not use "
            "phrases such as 'the answer is' or 'the correct option is'. "
            "Instead, explain what each option does neutrally and in equal "
            "detail, then ask the student which option they think matches the "
            "requirement and why. Your reply MUST end with that question back "
            "to the student."
        )

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_message}
        ]
    )
    return response.choices[0].message.content


def get_recommendation(topic: str, score: float):
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{
            "role": "user",
            "content": f"You are a learning advisor. A student scored {score}% on a {topic} level. Give a personalised 2-3 sentence study recommendation."
        }]
    )
    return response.choices[0].message.content