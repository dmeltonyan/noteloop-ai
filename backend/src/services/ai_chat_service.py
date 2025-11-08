"""
AI Chat Service for NoteLoop
"""
from openai import AsyncOpenAI
import os
from datetime import datetime

class AIChatService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        self.client = AsyncOpenAI(api_key=api_key) if api_key else None
        
    async def chat(self, user_id: str, message: str, context: dict = None):
        """Generate AI response with context"""
        if not self.client:
            return {
                "response": "AI chat is not available. Please configure OpenAI API key.",
                "error": "No API key"
            }
        
        try:
            # Build context from user's learning data
            system_prompt = """You are an AI learning assistant for NoteLoop, an adaptive learning platform. 
You help students understand concepts, explain answers, and provide personalized learning guidance.

IMPORTANT: Format all responses as concise summaries with:
- Key points in bullet format
- Quick takeaways
- Easy-to-remember facts
- Maximum 3-4 bullet points per response
- Use emojis sparingly for visual breaks

Be concise, clear, and encouraging. Reference their uploaded materials when relevant."""
            
            # Add context about user's progress if available
            if context:
                context_str = f"\nUser Context:\n- Overall ability: {context.get('overall_ability', 0)}\n"
                context_str += f"- Accuracy: {context.get('accuracy', 0)}%\n"
                context_str += f"- Concepts learned: {context.get('concepts_learned', 0)}\n"
                system_prompt += context_str
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ]
            
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=400,
                temperature=0.7
            )
            
            # Format response as summary with bullet points
            ai_response = response.choices[0].message.content.strip()
            
            # Ensure it's formatted as a summary (add bullets if not present)
            if not ai_response.startswith(('•', '-', '*', '1.', '2.', '3.')):
                # Try to format as bullets
                lines = ai_response.split('\n')
                formatted_lines = []
                for line in lines:
                    line = line.strip()
                    if line and not line.startswith(('•', '-', '*')):
                        formatted_lines.append(f"• {line}")
                    else:
                        formatted_lines.append(line)
                ai_response = '\n'.join(formatted_lines)
            
            return {
                "response": ai_response,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Chat error: {e}")
            return {
                "response": "Sorry, I encountered an error. Please try again.",
                "error": str(e)
            }
            
    async def explain_concept(self, concept_text: str, user_question: str = None):
        """Explain a concept in detail"""
        if not self.client:
            return {"response": "AI not available"}
        
        try:
            prompt = f"Explain this concept clearly and simply:\n\n{concept_text[:1000]}"
            
            if user_question:
                prompt += f"\n\nUser's specific question: {user_question}"
            
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert teacher explaining concepts clearly."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=600,
                temperature=0.7
            )
            
            return {
                "response": response.choices[0].message.content.strip(),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"response": f"Error: {str(e)}"}

ai_chat_service = AIChatService()



