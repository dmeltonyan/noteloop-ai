from openai import AsyncOpenAI
import os

class GPTContentGenerator:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        self.client = None
        if api_key:
            try:
                self.client = AsyncOpenAI(api_key=api_key)
                print("✅ GPT Content Generator initialized")
            except Exception as e:
                print(f"⚠️ OpenAI init failed: {e}")
        else:
            print("⚠️ No OPENAI_API_KEY set, running without LLM")

    async def generate(self, prompt: str):
        if not self.client:
            return {"error": "No OpenAI key configured"}
        try:
            resp = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}]
            )
            return resp.choices[0].message.content
        except Exception as e:
            return {"error": str(e)}
