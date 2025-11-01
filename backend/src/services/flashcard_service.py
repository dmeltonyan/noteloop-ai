from openai import AsyncOpenAI
import os
import json
from typing import List, Dict

class FlashcardService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            self.client = AsyncOpenAI(api_key=api_key)
            print("✅ Flashcard Service initialized (GPT-4)")
        else:
            print("⚠️ OpenAI API key not found")
            self.client = None
    
    async def generate_flashcards(self, text: str, num_cards: int = 10) -> List[Dict]:
        """Generate flashcards from text using GPT-4"""
        
        if not self.client:
            print("❌ OpenAI client not initialized")
            return []
        
        try:
            print(f"🤖 Generating {num_cards} flashcards with GPT-4...")
            
            prompt = f"""Create {num_cards} study flashcards from this text.

TEXT:
{text}

Return a JSON object with this EXACT structure:
{{
  "flashcards": [
    {{
      "question": "Clear question",
      "answer": "Concise answer",
      "difficulty": 1
    }}
  ]
}}

Make questions that test understanding. Difficulty: 1-5."""

            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are a flashcard expert. Return valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            data = json.loads(content)
            flashcards = data.get('flashcards', [])
            
            print(f"✅ Generated {len(flashcards)} flashcards")
            return flashcards
            
        except Exception as e:
            print(f"❌ Flashcard generation error: {e}")
            import traceback
            traceback.print_exc()
            return []
