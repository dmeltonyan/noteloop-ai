"""
Document Processor - Crash-resistant version
"""
from openai import AsyncOpenAI
import os
import uuid
import re

class DocumentProcessor:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        self.client = AsyncOpenAI(api_key=api_key) if api_key else None
        if self.client:
            print("[OK] Document Processor with GPT-4 Deep Analysis")
        else:
            print("[WARN] Document Processor (Smart Mode)")
    
    async def process_file(self, file_content: bytes, filename: str, content_type: str):
        """Process uploaded file safely"""
        print(f"\n📄 Processing: {filename} ({len(file_content)} bytes)")
        
        try:
            # Handle text files
            if content_type.startswith('text/') or filename.endswith(('.txt', '.md')):
                try:
                    text = file_content.decode('utf-8')
                    if len(text.strip()) < 20:
                        print("⚠️  Text too short")
                        return self._create_basic_concepts(filename)
                    
                    # Try GPT analysis first
                    if self.client:
                        try:
                            return await self._gpt_extract(text, filename)
                        except Exception as e:
                            print(f"⚠️  GPT failed: {e}, using smart extraction")
                    
                    # Fallback to smart extraction
                    return self._smart_extract(text)
                    
                except UnicodeDecodeError:
                    print("⚠️  Encoding error")
                    return self._create_basic_concepts(filename)
            
            # Handle PDFs
            if filename.endswith('.pdf'):
                try:
                    return await self._extract_pdf(file_content, filename)
                except Exception as e:
                    print(f"⚠️  PDF error: {e}")
                    return self._create_basic_concepts(filename)
            
            # Default fallback
            return self._create_basic_concepts(filename)
            
        except Exception as e:
            print(f"❌ Processing error: {e}")
            return self._create_basic_concepts(filename)
    
    async def _gpt_extract(self, text: str, filename: str):
        """Use GPT-4 for extraction"""
        print("🧠 GPT-4 analyzing...")
        
        try:
            prompt = f"""Analyze this text and extract 5-8 key learning concepts.

TEXT:
{text[:3000]}

Return JSON array:
[
  {{
    "topic_name": "Clear concept title",
    "description": "2-3 sentence explanation",
    "key_points": ["fact 1", "fact 2", "fact 3"],
    "difficulty": -0.5 to 0.5
  }}
]"""

            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Extract learning concepts from text. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.5,
                timeout=30.0  # Add timeout
            )
            
            import json
            content = response.choices[0].message.content.strip()
            content = re.sub(r'^```json\s*', '', content)
            content = re.sub(r'^```\s*', '', content)
            content = re.sub(r'\s*```$', '', content)
            
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                concepts_data = json.loads(json_match.group())
                
                concepts = []
                for concept in concepts_data[:8]:
                    concepts.append({
                        'id': str(uuid.uuid4()),
                        'topic_name': concept.get('topic_name', 'Concept')[:100],
                        'description': concept.get('description', '')[:500],
                        'difficulty': float(concept.get('difficulty', 0.0)),
                        'key_points': concept.get('key_points', [])[:5],
                        'source_text': text  # Include full source text
                    })
                
                if len(concepts) > 0:
                    print(f"✅ GPT-4 extracted {len(concepts)} concepts")
                    return concepts
            
            raise ValueError("Invalid GPT response")
            
        except Exception as e:
            print(f"⚠️  GPT extraction failed: {e}")
            raise
    
    def _smart_extract(self, text: str):
        """Smart extraction without GPT"""
        print("🧠 Smart extraction...")
        
        concepts = []
        
        # Split by paragraphs
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip() and len(p.strip()) > 50]
        
        if not paragraphs:
            # Split by sentences
            sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip() and len(s.strip()) > 30]
            paragraphs = []
            for i in range(0, len(sentences), 3):
                para = ' '.join(sentences[i:i+3])
                if para:
                    paragraphs.append(para)
        
        # Extract up to 8 concepts
        for i, para in enumerate(paragraphs[:8]):
            lines = [l.strip() for l in para.split('\n') if l.strip()]
            
            # Get title
            title = lines[0] if lines else f"Concept {i+1}"
            title = re.sub(r'^[0-9]+[\.\)]\s*', '', title)
            title = re.sub(r'^[#*\-]+\s*', '', title)
            title = title[:100]
            
            # Get description
            if len(lines) > 1:
                description = ' '.join(lines[1:])
            else:
                description = para
            description = description[:500]
            
            # Extract key points
            key_points = [line for line in lines[1:5] if 20 < len(line) < 200]
            
            # Calculate difficulty
            word_count = len(description.split())
            avg_word_length = sum(len(w) for w in description.split()) / max(word_count, 1)
            difficulty = -1.0 + (avg_word_length - 4) * 0.3
            difficulty = max(-1.0, min(1.0, difficulty + (i - 3) * 0.2))
            
            concepts.append({
                'id': str(uuid.uuid4()),
                'topic_name': title,
                'description': description,
                'difficulty': difficulty,
                'key_points': key_points,
                'source_text': text  # Include full source text
            })
        
        print(f"✅ Smart extraction: {len(concepts)} concepts")
        return concepts
    
    async def _extract_pdf(self, pdf_bytes: bytes, filename: str):
        """Extract from PDF"""
        try:
            import pdfplumber
            import io
            
            print("📖 Extracting PDF...")
            pdf_file = io.BytesIO(pdf_bytes)
            all_text = ""
            
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages[:10]:
                    text = page.extract_text()
                    if text:
                        all_text += text + "\n\n"
            
            if all_text.strip():
                if self.client:
                    try:
                        return await self._gpt_extract(all_text, filename)
                    except:
                        pass
                return self._smart_extract(all_text)
        except ImportError:
            print("⚠️  pdfplumber not installed")
        except Exception as e:
            print(f"⚠️  PDF error: {e}")
        
        return self._create_basic_concepts(filename)
    
    def _create_basic_concepts(self, filename: str):
        """Create basic fallback concepts"""
        base_name = filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ')
        
        concepts = []
        for i in range(3):
            concepts.append({
                'id': str(uuid.uuid4()),
                'topic_name': f"{base_name} - Part {i+1}",
                'description': f"Learning material from {filename}. This content covers important concepts related to {base_name}.",
                'difficulty': (i - 1) * 0.5,
                'key_points': [f"Key concept {i+1} from the uploaded material"]
            })
        
        print(f"✅ Created {len(concepts)} basic concepts")
        return concepts

document_processor = DocumentProcessor()
