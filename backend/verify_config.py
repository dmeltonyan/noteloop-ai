import os
from dotenv import load_dotenv

load_dotenv()

print("=" * 70)
print("NOTELOOP AI - CONFIGURATION VERIFICATION")
print("=" * 70)

# Check 1: OpenAI API Key
print("\n1. CHECKING OPENAI API KEY...")
openai_key = os.getenv("OPENAI_API_KEY")

if not openai_key:
    print("   X NO OPENAI KEY FOUND")
elif openai_key == "your_openai_key_here":
    print("   ! PLACEHOLDER KEY - Replace with real key")
elif openai_key.startswith("sk-"):
    print(f"   + OpenAI key loaded: {openai_key[:20]}...")
    try:
        from openai import OpenAI
        client = OpenAI(api_key=openai_key)
        models = client.models.list()
        print("   + OpenAI API connection successful!")
    except Exception as e:
        print(f"   X OpenAI API error: {e}")
else:
    print("   ! Unusual key format")

# Check 2: Supabase Configuration
print("\n2. CHECKING SUPABASE CONFIGURATION...")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url:
    print("   X NO SUPABASE URL FOUND")
elif "YOUR_PROJECT_ID" in supabase_url:
    print("   ! PLACEHOLDER URL - Replace with real URL")
else:
    print(f"   + Supabase URL: {supabase_url}")

if not supabase_key:
    print("   X NO SUPABASE KEY FOUND")
elif "YOUR_ACTUAL" in supabase_key:
    print("   ! PLACEHOLDER KEY - Replace with real key")
elif supabase_key.startswith("eyJ"):
    print(f"   + Supabase key loaded: {supabase_key[:30]}...")
    
    # Test connection
    try:
        from supabase import create_client
        supabase = create_client(supabase_url, supabase_key)
        result = supabase.table("users").select("id").limit(1).execute()
        print("   + Supabase connection successful!")
        print(f"   + Database accessible - found {len(result.data)} users")
    except Exception as e:
        print(f"   X Supabase connection error: {e}")
else:
    print("   ! Unusual key format")

print("\n" + "=" * 70)
print("CONFIGURATION CHECK COMPLETE")
print("=" * 70)

# Summary
all_good = (
    openai_key and openai_key.startswith("sk-") and
    supabase_url and "YOUR_PROJECT" not in supabase_url and
    supabase_key and supabase_key.startswith("eyJ")
)

if all_good:
    print("\nALL CONFIGURATIONS VALID!")
    print("You're ready to run the application!")
else:
    print("\nSOME CONFIGURATIONS NEED ATTENTION")
    print("Please update .env file with correct values")

print("\n" + "=" * 70)
