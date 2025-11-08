"""
AI Tutor Service
Provides one-on-one tutoring sessions with Socratic questioning
"""
from openai import AsyncOpenAI
import os
from datetime import datetime
from typing import Dict, List, Optional
import uuid
from src.models.database import db

class AITutorService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        self.client = AsyncOpenAI(api_key=api_key) if api_key else None
        
    async def start_session(self, user_id: str, topic: str = None, upload_id: str = None) -> Dict:
        """Start a new tutoring session"""
        session_id = str(uuid.uuid4())
        
        # Get user context
        user = db.get_user(user_id)
        if not user:
            return {"error": "User not found"}
        
        accuracy = (user.correct_answers / user.total_questions * 100) if user.total_questions > 0 else 0
        concepts_learned = len([m for m in user.concept_mastery.values() if (m if isinstance(m, float) else m.get('mastery', 0)) > 0.7])
        
        # Get uploaded content if upload_id provided
        uploaded_content = None
        if upload_id:
            concepts = db.get_concepts_by_upload(upload_id)
            quizzes = db.get_quizzes_by_upload(upload_id)
            upload_info = db.get_upload(upload_id)
            
            if concepts or quizzes:
                uploaded_content = {
                    "upload_id": upload_id,
                    "filename": upload_info.get("filename", "uploaded file") if upload_info else "uploaded file",
                    "concepts": [
                        {
                            "topic_name": c.topic_name,
                            "description": c.description,
                            "source_text": c.source_text[:1000] if c.source_text else ""  # Limit for prompt
                        }
                        for c in concepts[:20]  # Limit to 20 concepts
                    ],
                    "concepts_count": len(concepts),
                    "quizzes_count": len(quizzes)
                }
        
        # Initialize session
        session = {
            "id": session_id,
            "user_id": user_id,
            "topic": topic or "General Learning",
            "upload_id": upload_id,
            "created_at": datetime.now().isoformat(),
            "messages": [],
            "questions_asked": 0,
            "concepts_covered": [],
            "user_ability": user.overall_ability,
            "status": "active"
        }
        
        # Add welcome message
        welcome_message = await self._generate_welcome_message(user, topic, accuracy, concepts_learned, uploaded_content)
        session["messages"].append({
            "role": "tutor",
            "content": welcome_message,
            "timestamp": datetime.now().isoformat()
        })
        
        # Store session
        db.add_tutor_session(user_id, session)
        
        return session
    
    async def _generate_welcome_message(self, user, topic: str, accuracy: float, concepts_learned: int, uploaded_content: Dict = None) -> str:
        """Generate personalized welcome message"""
        if not self.client:
            if uploaded_content:
                return f"Welcome! I've reviewed your uploaded material ({uploaded_content['filename']}) with {uploaded_content['concepts_count']} concepts. Let's study this together! What would you like to focus on?"
            return f"Welcome to your tutoring session! Let's work on {topic or 'your studies'} today. What would you like to focus on?"
        
        try:
            content_context = ""
            if uploaded_content:
                content_summary = "\n".join([
                    f"- {c['topic_name']}: {c['description'][:150]}"
                    for c in uploaded_content['concepts'][:10]
                ])
                content_context = f"""
Uploaded Material Context:
- File: {uploaded_content['filename']}
- Concepts available: {uploaded_content['concepts_count']}
- Key topics from the material:
{content_summary}

You have access to the full content of this uploaded material. Reference specific concepts, examples, and details from the material when helping the student.
"""
            
            prompt = f"""You are a friendly, encouraging AI tutor. Create a warm welcome message for a student.
User stats:
- Overall ability: {user.overall_ability:.2f}
- Accuracy: {accuracy:.1f}%
- Concepts mastered: {concepts_learned}
- Topic focus: {topic or 'General learning'}
{content_context}

Write a brief (2-3 sentences) welcoming message that:
1. Greets them warmly
2. {'Mentions that you\'ve reviewed their uploaded material and are ready to help them study it' if uploaded_content else 'Acknowledges their progress'}
3. Asks what they'd like to work on today

Be encouraging and supportive."""
            
            system_prompt = "You are an expert AI tutor who adapts teaching style to each student."
            if uploaded_content:
                system_prompt += " You have access to the student's uploaded study material. Reference specific concepts, examples, and details from their material when teaching."
            
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.8
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            if uploaded_content:
                return f"Welcome! I've reviewed your uploaded material ({uploaded_content['filename']}) with {uploaded_content['concepts_count']} concepts. Let's study this together! What would you like to focus on?"
            return f"Welcome! I'm your AI tutor. Let's work on {topic or 'your studies'} today. What would you like to focus on?"
    
    async def process_message(self, user_id: str, session_id: str, user_message: str) -> Dict:
        """Process user message and generate tutor response"""
        session = db.get_tutor_session(user_id, session_id)
        if not session:
            return {"error": "Session not found"}
        
        # Add user message to session
        session["messages"].append({
            "role": "user",
            "content": user_message,
            "timestamp": datetime.now().isoformat()
        })
        
        # Get user context
        user = db.get_user(user_id)
        accuracy = (user.correct_answers / user.total_questions * 100) if user.total_questions > 0 else 0
        
        # Get uploaded content if session has upload_id
        uploaded_content = None
        if session.get("upload_id"):
            concepts = db.get_concepts_by_upload(session["upload_id"])
            if concepts:
                uploaded_content = {
                    "concepts": [
                        {
                            "topic_name": c.topic_name,
                            "description": c.description,
                            "source_text": c.source_text[:1000] if c.source_text else ""
                        }
                        for c in concepts[:20]
                    ]
                }
        
        # Generate tutor response
        tutor_response = await self._generate_tutor_response(user, session, user_message, accuracy, uploaded_content)
        
        # Add tutor response to session
        session["messages"].append({
            "role": "tutor",
            "content": tutor_response,
            "timestamp": datetime.now().isoformat()
        })
        
        # Update session
        db.update_tutor_session(user_id, session_id, session)
        
        return {
            "response": tutor_response,
            "session": session
        }
    
    async def _generate_tutor_response(self, user, session: Dict, user_message: str, accuracy: float, uploaded_content: Dict = None) -> str:
        """Generate tutor response using Socratic method"""
        if not self.client:
            return "I'm here to help! Can you tell me more about what you're struggling with?"
        
        try:
            # Build conversation history
            conversation_history = []
            for msg in session["messages"][-10:]:  # Last 10 messages for context
                role = "assistant" if msg["role"] == "tutor" else "user"
                conversation_history.append({"role": role, "content": msg["content"]})
            
            # Build system prompt with Socratic method
            system_prompt = """You are an expert AI tutor using the Socratic method. Your teaching style:
1. Ask guiding questions instead of giving direct answers
2. Help students discover answers themselves
3. Break complex problems into smaller steps
4. Provide encouragement and positive reinforcement
5. Adapt difficulty based on student responses
6. Use real-world examples when helpful

Be supportive, patient, and encouraging. Guide them to understanding rather than just telling them the answer."""
            
            # Add uploaded content context if available
            content_context = ""
            if uploaded_content and uploaded_content.get("concepts"):
                concepts_text = "\n\n".join([
                    f"Topic: {c['topic_name']}\nDescription: {c['description']}\nSource: {c['source_text'][:300]}"
                    for c in uploaded_content["concepts"][:15]  # Limit to 15 concepts for prompt size
                ])
                content_context = f"""

IMPORTANT - Uploaded Study Material:
The student has uploaded study material. You have access to the following concepts and content:

{concepts_text}

When answering questions or teaching:
- Reference specific concepts, examples, and details from their uploaded material
- Use the exact terminology and definitions from their material
- Connect new questions to concepts already covered in their material
- If they ask about something not in the material, acknowledge it and guide them appropriately
- Make sure your explanations align with the content they've uploaded
"""
                system_prompt += "\n\nYou have access to the student's uploaded study material. Always reference specific concepts, examples, and details from their material when teaching."
            
            # Add user context
            context_info = f"\nStudent Context:\n- Overall ability: {user.overall_ability:.2f}\n- Accuracy: {accuracy:.1f}%\n- Session topic: {session.get('topic', 'General')}\n"
            
            messages = [
                {"role": "system", "content": system_prompt + context_info + content_context},
                *conversation_history,
                {"role": "user", "content": user_message}
            ]
            
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            return "I'm here to help! Can you tell me more about what you're struggling with?"
    
    async def generate_question(self, user_id: str, session_id: str, concept_id: str = None) -> Dict:
        """Generate a practice question for the student"""
        session = db.get_tutor_session(user_id, session_id)
        if not session:
            return {"error": "Session not found"}
        
        # Get concept if provided
        concept = None
        if concept_id:
            concept = db.get_concept(concept_id)
        
        # Get user context
        user = db.get_user(user_id)
        accuracy = (user.correct_answers / user.total_questions * 100) if user.total_questions > 0 else 0
        
        # Generate question
        question_data = await self._generate_practice_question(user, session, concept, accuracy)
        
        session["questions_asked"] += 1
        if concept_id:
            session["concepts_covered"].append(concept_id)
        
        db.update_tutor_session(user_id, session_id, session)
        
        return question_data
    
    async def _generate_practice_question(self, user, session: Dict, concept: Optional = None, accuracy: float = 0.0) -> Dict:
        """Generate a practice question"""
        if not self.client:
            topic = concept.topic_name if concept else session.get("topic", "learning")
            return {
                "question": f"Tell me about {topic}. What do you understand about it?",
                "type": "explanation",
                "hint": "Think about the main concepts and how they relate to each other."
            }
        
        try:
            # Build prompt for question generation
            concept_info = ""
            if concept:
                concept_info = f"\nConcept to focus on:\n- Topic: {concept.topic_name}\n- Description: {concept.description[:300]}\n"
            
            prompt = f"""Generate a practice question for a student tutoring session.
{concept_info}
Session topic: {session.get('topic', 'General learning')}
Student ability: {user.overall_ability:.2f}
Student accuracy: {accuracy:.1f}%

Create a question that:
1. Tests understanding at an appropriate difficulty level
2. Encourages critical thinking
3. Can be answered with explanation or multiple choice
4. Relates to the session topic

Return ONLY a JSON object with:
- "question": the question text
- "type": "multiple_choice" or "explanation"
- "options": ["option1", "option2", ...] if multiple_choice
- "correct_answer": the correct answer
- "hint": a helpful hint if they struggle
- "explanation": why this answer is correct"""
            
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert question generator for educational tutoring."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            import json
            question_data = json.loads(response.choices[0].message.content.strip())
            return question_data
        except Exception as e:
            topic = concept.topic_name if concept else session.get("topic", "learning")
            return {
                "question": f"Let's practice {topic}. Can you explain what you know about it?",
                "type": "explanation",
                "hint": "Think step by step about the key concepts."
            }

ai_tutor_service = AITutorService()

