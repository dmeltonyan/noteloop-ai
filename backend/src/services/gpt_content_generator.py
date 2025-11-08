"""
GPT Content Generator with Source Tracking
"""
from openai import AsyncOpenAI, OpenAI
import os
import uuid
import json
import re
import asyncio

class GPTContentGenerator:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        self.async_client = AsyncOpenAI(api_key=api_key) if api_key else None
        self.sync_client = OpenAI(api_key=api_key) if api_key else None
        
        if api_key:
            print(f"[OK] GPT Content Generator (Enhanced)")
        else:
            print("[WARN] GPT Generator (Fallback)")
    
    def generate_quizzes_sync(self, name, desc, num_questions=3, source_text=""):
        """Generate quizzes with source tracking"""
        
        if not self.sync_client or not desc or len(desc) < 20:
            return self._create_fallback_quizzes(name, desc, num_questions, source_text)
        
        try:
            print(f"🎯 Generating {num_questions} contextual quizzes...")
            
            prompt = f"""Create {num_questions} multiple choice questions testing understanding of this content:

TOPIC: {name}

CONTENT:
{desc}

Create questions that:
1. Test specific details from the content
2. Have clear, unambiguous answers
3. Include plausible distractors
4. Reference the source material

Return ONLY valid JSON (no markdown):
[
  {{
    "question": "Specific question testing comprehension?",
    "options": ["Correct answer", "Plausible distractor 1", "Plausible distractor 2", "Plausible distractor 3"],
    "correct_answer": "Correct answer",
    "explanation": "Detailed explanation referencing the source material",
    "source_excerpt": "Relevant excerpt from content that supports the answer"
  }}
]"""

            response = self.sync_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert at creating educational assessments. Create questions that test understanding of provided content with detailed explanations."
                    },
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,
                temperature=0.6
            )
            
            content = response.choices[0].message.content.strip()
            content = re.sub(r'^```json\s*', '', content)
            content = re.sub(r'^```\s*', '', content)
            content = re.sub(r'\s*```$', '', content)
            
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if not json_match:
                raise ValueError("No JSON in response")
            
            quizzes_data = json.loads(json_match.group())
            
            result = []
            for i, q in enumerate(quizzes_data[:num_questions]):
                quiz = {
                    'id': str(uuid.uuid4()),
                    'question': q.get('question', f'What is {name}?'),
                    'correct_answer': q.get('correct_answer', ''),
                    'options': q.get('options', []),
                    'difficulty': -0.5 + (i * 0.5),
                    'explanation': q.get('explanation', ''),
                    'source_text': q.get('source_excerpt', desc[:200]),
                    'concept_name': name
                }
                
                if not quiz['correct_answer'] or len(quiz['options']) < 4:
                    raise ValueError("Invalid quiz format")
                
                if quiz['correct_answer'] not in quiz['options']:
                    quiz['options'][0] = quiz['correct_answer']
                
                result.append(quiz)
            
            print(f"✅ Generated {len(result)} enhanced quizzes")
            return result
                
        except Exception as e:
            print(f"⚠️  Quiz generation failed: {e}")
            return self._create_fallback_quizzes(name, desc, num_questions, source_text)
    
    async def generate_quizzes(self, name, desc, num_questions=3, source_text=""):
        """Async wrapper"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, 
            self.generate_quizzes_sync,
            name, desc, num_questions, source_text
        )
    
    def _create_fallback_quizzes(self, name, desc, num_questions, source_text=""):
        """Enhanced fallback"""
        quizzes = []
        sentences = [s.strip() for s in desc.split('.') if s.strip() and len(s.strip()) > 25]
        
        for i in range(num_questions):
            if i < len(sentences):
                correct = sentences[i]
                source_excerpt = sentences[i]
            else:
                correct = sentences[0] if sentences else desc[:100]
                source_excerpt = desc[:200]
            
            words = correct.split()
            wrong1 = ' '.join(words[:len(words)//2]) + " but incomplete"
            wrong2 = "This is a misconception about " + name
            wrong3 = "Related but incorrect concept"
            
            options = [correct, wrong1, wrong2, wrong3]
            
            import random
            random.shuffle(options)
            
            quizzes.append({
                'id': str(uuid.uuid4()),
                'question': f'Which statement accurately describes {name}?',
                'correct_answer': correct,
                'options': options,
                'difficulty': -0.5 + (i * 0.5),
                'explanation': f'The correct answer directly references the source material: {correct[:100]}',
                'source_text': source_excerpt,
                'concept_name': name
            })
        
        return quizzes

    async def generate_video_script(self, name, desc, points, dur=60):
        """Video script generation (unchanged)"""
        if self.async_client and desc and len(desc) > 20:
            try:
                points_text = '\n'.join(f'- {p}' for p in points if p)
                
                prompt = f"""Create an engaging 60-second educational video script.

TOPIC: {name}
CONTENT: {desc}
KEY POINTS: {points_text}

Write 150-180 words explaining the concept clearly."""

                response = await self.async_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are an expert educational video scriptwriter."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=400,
                    temperature=0.7
                )
                
                script = response.choices[0].message.content.strip()
                
                if script and len(script.split()) >= 100:
                    return {
                        'id': str(uuid.uuid4()),
                        'title': f"Understanding {name}",
                        'full_script': script,
                        'duration_seconds': dur
                    }
                    
            except Exception as e:
                print(f"⚠️  Script generation failed: {e}")
        
        script = self._create_fallback_script(name, desc, points)
        return {
            'id': str(uuid.uuid4()),
            'title': f"Understanding {name}",
            'full_script': script,
            'duration_seconds': dur
        }
    
    def _create_fallback_script(self, name, desc, points):
        parts = [f"Let's explore {name}."]
        if desc and len(desc) > 30:
            sentences = [s.strip() + '.' for s in desc.split('.') if s.strip()]
            parts.extend(sentences[:3])
        if points and len(points) > 0:
            parts.append("Key points:")
            for point in points[:3]:
                if point and len(point) > 10:
                    parts.append(f"{point}.")
        parts.append(f"Understanding {name} is essential for mastery.")
        return " ".join(parts)

gpt_generator = GPTContentGenerator()
