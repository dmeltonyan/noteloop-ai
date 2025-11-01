import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

print("=" * 60)
print("OPENAI API KEY CHECK")
print("=" * 60)

if not api_key:
    print("❌ NO API KEY FOUND")
    print("   Please add OPENAI_API_KEY to .env file")
elif api_key == "your_openai_key_here":
    print("⚠️  DEFAULT PLACEHOLDER KEY")
    print("   Replace with your actual OpenAI API key")
elif api_key.startswith("sk-"):
    print("✅ API KEY LOADED")
    print(f"   Key starts with: {api_key[:15]}...")
    print(f"   Key length: {len(api_key)} characters")
    
    # Test if it's valid
    from openai import OpenAI
    try:
        client = OpenAI(api_key=api_key)
        # Simple test
        response = client.models.list()
        print("✅ API KEY IS VALID")
        print("   Connection to OpenAI successful!")
    except Exception as e:
        print("❌ API KEY INVALID")
        print(f"   Error: {e}")
else:
    print("⚠️  UNUSUAL API KEY FORMAT")
    print(f"   Key: {api_key[:20]}...")
    print("   Expected format: sk-...")

print("=" * 60)
