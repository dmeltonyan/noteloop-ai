import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

print("=" * 60)
print("OPENAI API KEY TEST")
print("=" * 60)

api_key = os.getenv("OPENAI_API_KEY")

# Check 1: Is key loaded?
if not api_key:
    print("\nX NO KEY FOUND in .env file")
    print("  Solution: Add OPENAI_API_KEY=your-key to .env")
    exit(1)

print(f"\n1. Key Format Check:")
print(f"   Key starts with: {api_key[:15]}...")
print(f"   Key length: {len(api_key)} characters")

if not api_key.startswith("sk-"):
    print("   X Key should start with 'sk-' or 'sk-proj-'")
    exit(1)

if len(api_key) < 40:
    print("   X Key too short - you may have copied only part of it")
    print("   Full keys are usually 90-140 characters")
    exit(1)

print("   + Key format looks good")

# Check 2: Test connection
print(f"\n2. Testing Connection to OpenAI...")
try:
    client = OpenAI(api_key=api_key)
    
    # Try a simple API call
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Say 'API key works!'"}],
        max_tokens=10
    )
    
    print("   + API KEY IS VALID!")
    print(f"   + Response: {response.choices[0].message.content}")
    print("\n" + "=" * 60)
    print("SUCCESS! Your OpenAI API key works!")
    print("=" * 60)
    
except Exception as e:
    print(f"   X API KEY INVALID")
    print(f"   Error: {e}")
    print("\n   Solutions:")
    print("   1. Create a NEW API key at: https://platform.openai.com/api-keys")
    print("   2. Copy the FULL key (90-140 characters)")
    print("   3. Replace in .env file")
    print("   4. Make sure you have billing enabled")
    exit(1)
