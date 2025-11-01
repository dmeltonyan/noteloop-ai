from openai import AsyncOpenAI
import os
import json
from typing import List, Dict
import uuid

class GPTContentGenerator:
    """Generates questions and lessons using GPT-4"""
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            self.client = AsyncOpenAI(api_key=api_key)
            print("✅ GPT Content Generator initialized")
        else:
            print("⚠️ OpenAI API key not found")
            self.client = None
    
    async def generate_questions_for_concept(self, concept_name: str, concept_description: str, 
                                            num_questions: int = 10) -> List[Dict]:
        """Generate quiz questions at multiple difficulty levels"""
        
        if not self.client:
            return self._generate_fallback_questions(concept_name)
        
        try:
            prompt = f"""Generate {num_questions} quiz questions about: {concept_name}

Description: {concept_description}

Create questions at 5 difficulty levels:
- Level 1-2: Basic recall and understanding
- Level 3-4: Application and analysis
- Level 5: Advanced synthesis and evaluation

Return JSON with this structure:
{{
  "questions": [
    {{
      "question": "Question text",
      "answer": "Correct answer",
      "difficulty": 1-5,
      "explanation": "Why this answer is correct"
    }}
  ]
}}

Make questions clear, concise, and pedagogically sound."""

            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are an expert educator creating adaptive learning content."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            data = json.loads(response.choices[0].message.content)
            questions = data.get('questions', [])
            
            # Normalize difficulty to IRT scale (-1 to 1)
            for q in questions:
                q['difficulty'] = (q['difficulty'] - 3) / 3
                q['id'] = str(uuid.uuid4())
            
            print(f"✅ Generated {len(questions)} questions for {concept_name}")
            return questions
            
        except Exception as e:
            print(f"❌ Error generating questions: {e}")
            return self._generate_fallback_questions(concept_name)
    
    async def generate_micro_lesson(self, concept_name: str, concept_description: str,
                                   difficulty_level: str, user_context: Dict = None) -> Dict:
        """Generate a 30-second micro-lesson"""
        
        if not self.client:
            return self._generate_fallback_lesson(concept_name, difficulty_level)
        
        try:
            context_text = ""
            if user_context:
                context_text = f"\nUser's current level: {user_context.get('theta', 0)}"
            
            prompt = f"""Create a 30-second micro-lesson about: {concept_name}

Description: {concept_description}
Difficulty Level: {difficulty_level}
{context_text}

The lesson should:
- Be exactly 150-200 words (30 seconds to read/view)
- Use clear, engaging language
- Include one memorable example or analogy
- End with a key takeaway

Difficulty levels:
- comfortable: Review material they know
- optimal: Slightly challenging, builds on existing knowledge
- stretch: Pushes boundaries, introduces advanced concepts

Return JSON:
{{
  "title": "Lesson title",
  "content": "Lesson content (150-200 words)",
  "key_takeaway": "One sentence summary",
  "example": "Memorable example or analogy"
}}"""

            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are an expert educator creating micro-learning content."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                response_format={"type": "json_object"}
            )
            
            lesson = json.loads(response.choices[0].message.content)
            lesson['id'] = str(uuid.uuid4())
            lesson['difficulty_level'] = difficulty_level
            
            print(f"✅ Generated lesson: {lesson['title']}")
            return lesson
            
        except Exception as e:
            print(f"❌ Error generating lesson: {e}")
            return self._generate_fallback_lesson(concept_name, difficulty_level)
    
    def _generate_fallback_questions(self, concept_name: str) -> List[Dict]:
        """Fallback questions when API is unavailable"""
        return [
            {
                "id": str(uuid.uuid4()),
                "question": f"What is {concept_name}?",
                "answer": f"A fundamental concept in the subject matter",
                "difficulty": 0.0,
                "explanation": "This is a basic recall question"
            }
        ]
    
    def _generate_fallback_lesson(self, concept_name: str, difficulty_level: str) -> Dict:
        """Fallback lesson when API is unavailable"""
        return {
            "id": str(uuid.uuid4()),
            "title": concept_name,
            "content": f"This is an introduction to {concept_name}. It represents key material you need to learn.",
            "key_takeaway": f"Understanding {concept_name} is essential for mastery",
            "difficulty_level": difficulty_level
        }

# Global instance
gpt_generator = GPTContentGenerator()
