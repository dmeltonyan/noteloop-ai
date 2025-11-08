"""
LLM Client - Groq API Integration
Uses Llama 3.1 70B for fast, high-quality content generation
"""
import os
from typing import Optional, Dict, List
import json
import re

# Try to import Groq, but allow fallback if not installed
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    print("⚠️  Groq library not installed. Install with: pip install groq")

class LLMClient:
    """
    Free LLM client using Groq API with Llama 3.1 70B
    
    Why Groq + Llama 3.1 70B:
    - Fastest inference (tokens/second)
    - Free tier: 30 requests/minute, 14,400 requests/day
    - High quality outputs comparable to GPT-4
    - Excellent structured JSON support
    - Easy integration
    """
    
    def __init__(self):
        if not GROQ_AVAILABLE:
            self.client = None
            self.model = None
            print("⚠️  LLM Client: Groq library not installed. Install with: pip install groq")
            return
        
        api_key = os.getenv("GROQ_API_KEY")
        try:
            self.client = Groq(api_key=api_key) if api_key else None
            self.model = "llama-3.1-70b-versatile"  # Best quality/speed balance
            
            if self.client:
                print("✅ LLM Client Ready (Groq Llama 3.1 70B)")
            else:
                print("⚠️  LLM Client: No API key found. Set GROQ_API_KEY environment variable.")
                print("   Get free API key at: https://console.groq.com/")
        except Exception as e:
            print(f"⚠️  LLM Client initialization error: {e}")
            self.client = None
            self.model = None
    
    async def generate(
        self,
        prompt: str,
        system_prompt: str = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        response_format: str = "text"
    ) -> str:
        """
        Generate text using LLM
        
        Args:
            prompt: User prompt
            system_prompt: System instructions
            temperature: Creativity (0.0-1.0)
            max_tokens: Maximum tokens to generate
            response_format: "text" or "json"
        
        Returns:
            Generated text
        """
        if not self.client:
            return self._fallback_response(prompt)
        
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            # Groq API call
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                response_format={"type": "json_object"} if response_format == "json" else None
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"❌ LLM generation error: {e}")
            return self._fallback_response(prompt)
    
    async def generate_json(
        self,
        prompt: str,
        system_prompt: str = None,
        temperature: float = 0.3
    ) -> Dict:
        """
        Generate structured JSON output
        
        Args:
            prompt: User prompt with JSON schema instructions
            system_prompt: System instructions
            temperature: Lower for more consistent structure
        
        Returns:
            Parsed JSON dictionary
        """
        if not self.client:
            return self._fallback_json()
        
        try:
            # Ensure JSON format instructions
            json_prompt = f"""{prompt}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanations. Just the JSON object."""
            
            response_text = await self.generate(
                prompt=json_prompt,
                system_prompt=system_prompt or "You are a JSON generator. Always return valid JSON only.",
                temperature=temperature,
                response_format="json"
            )
            
            # Parse JSON (handle markdown code blocks if present)
            json_text = self._extract_json(response_text)
            return json.loads(json_text)
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing error: {e}")
            print(f"   Response: {response_text[:200]}")
            return self._fallback_json()
        except Exception as e:
            print(f"❌ JSON generation error: {e}")
            return self._fallback_json()
    
    def _extract_json(self, text: str) -> str:
        """Extract JSON from text, handling markdown code blocks"""
        # Try to find JSON in code blocks
        json_match = re.search(r'```(?:json)?\s*(\{.*\})\s*```', text, re.DOTALL)
        if json_match:
            return json_match.group(1)
        
        # Try to find JSON object directly
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json_match.group(0)
        
        # Return as-is if no pattern found
        return text
    
    def _fallback_response(self, prompt: str) -> str:
        """Fallback response when LLM is unavailable"""
        return f"I'm currently unavailable. Please configure GROQ_API_KEY to enable AI features.\n\nPrompt received: {prompt[:100]}..."
    
    def _fallback_json(self) -> Dict:
        """Fallback JSON when LLM is unavailable"""
        return {
            "error": "LLM service unavailable",
            "message": "Please configure GROQ_API_KEY environment variable"
        }
    
    def is_available(self) -> bool:
        """Check if LLM client is available"""
        return self.client is not None

# Global instance
llm_client = LLMClient()

