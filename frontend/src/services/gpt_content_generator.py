"""
GPT Content Generator - Fixed version
"""
from openai import AsyncOpenAI
import os
import uuid
import json
import re

class GPTContentGenerator:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        self.client = AsyncOpenAI(api_key=api_key) if api_key else None
        if self.client:
            print("✅ GPT Generator Ready (GPT-4 Enabled)")
        else:
            print("✅ GPT Generator Ready (Fallback Mode)")
    
    async def generate_video_script(self, name, desc, points, dur=60):
        """Generate engaging video script"""
        
        if self.client:
            try:
                prompt = f"""Create an engaging 60-second educational video script about: {name}

Description: {desc}

Key points to cover:
{chr(10).join(f'- {point}' for point in points if point)}

Requirements:
- Conversational and engaging tone
- Clear explanations suitable for learners
- Include examples or analogies
- 150-180 words (60 seconds at normal speaking pace)
- No special formatting, just natural speech

Script:"""

                response = await self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are an expert educational content creator."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=300,
                    temperature=0.7
                )
                
                script = response.choices[0].message.content.strip()
                
                return {
                    'id': str(uuid.uuid4()),
                    'title': f"Understanding {name}",
                    'full_script': script,
                    'duration_seconds': dur
                }
            except Exception as e:
                print(f"⚠️  GPT script generation failed: {e}")
        
        # Fallback
        script = self._create_fallback_script(name, desc, points)
        return {
            'id': str(uuid.uuid4()),
            'title': f"Understanding {name}",
            'full_script': script,
            'duration_seconds': dur
        }
    
    def _create_fallback_script(self, name, desc, points):
        """Create smart fallback script"""
        parts = []
        parts.append(f"Let's learn about {name}.")
        
        if desc and len(desc) > 20:
            parts.append(desc)
        
        if points and len(points) > 0:
            parts.append("Here are the key things to remember:")
            for i, point in enumerate(points[:3], 1):
                if point and len(point) > 5:
                    parts.append(f"Point {i}: {point}")
        
        parts.append(f"Understanding {name} is an important step in your learning journey.")
        
        return " ".join(parts)
    
    async def generate_quizzes(self, name, desc, num_questions=3):
        """Generate quiz questions"""
        
        if not self.client:
            return self._create_fallback_quizzes(name, desc, num_questions)
        
        try:
            prompt = f"""Create {num_questions} multiple choice quiz questions about: {name}

Context: {desc}

Return ONLY a JSON array like this (no other text):
[
  {{
    "question": "Clear question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A",
    "explanation": "Brief explanation"
  }}
]"""

            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert at creating educational quiz questions. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            content = response.choices[0].message.content.strip()
            
            # Try to extract JSON
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                quizzes_data = json.loads(json_match.group())
                
                result = []
                for i, q in enumerate(quizzes_data[:num_questions]):
                    result.append({
                        'id': str(uuid.uuid4()),
                        'question': q.get('question', f'What is {name}?'),
                        'correct_answer': q.get('correct_answer', q.get('options', ['A'])[0]),
                        'options': q.get('options', ['A', 'B', 'C', 'D']),
                        'difficulty': -0.5 + (i * 0.5),
                        'explanation': q.get('explanation', f'This relates to {name}')
                    })
                
                print(f"✅ GPT generated {len(result)} quizzes")
                return result
            else:
                raise ValueError("No JSON found in response")
                
        except Exception as e:
            print(f"⚠️  GPT quiz generation failed: {e}")
            return self._create_fallback_quizzes(name, desc, num_questions)
    
    def _create_fallback_quizzes(self, name, desc, num_questions):
        """Create smart fallback quizzes"""
        quizzes = []
        
        for i in range(num_questions):
            correct = desc[:80] if desc and len(desc) > 20 else f"Core concept of {name}"
            
            options = [
                correct,
                f"Alternative aspect of {name}",
                f"Different interpretation of {name}",
                f"Related but incorrect concept"
            ]
            
            import random
            random.shuffle(options)
            
            quizzes.append({
                'id': str(uuid.uuid4()),
                'question': f"What is the main idea of {name}?",
                'correct_answer': correct,
                'options': options,
                'difficulty': -0.5 + (i * 0.5),
                'explanation': f'{name}: {desc[:150] if desc else "Key concept"}'
            })
        
        print(f"✅ Fallback created {len(quizzes)} quizzes")
        return quizzes

gpt_generator = GPTContentGenerator()
