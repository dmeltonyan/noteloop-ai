"""
Advanced Content Processor
- Real PDF text extraction
- GPT-4 Vision for images (handwriting, textbooks, whiteboards)
- Intelligent concept extraction
- Learning path generation
"""

from openai import AsyncOpenAI
import os
import base64
import json
from typing import List, Dict
import uuid
import re

class AdvancedContentProcessor:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        self.client = AsyncOpenAI(api_key=api_key) if api_key else None
        
        if self.client:
            print("✅ Advanced Content Processor with GPT-4 Vision")
        else:
            print("⚠️  Advanced Content Processor (Fallback Mode)")
    
    async def process_uploaded_file(self, file_content: bytes, filename: str, content_type: str):
        """
        Main entry point - processes any file type and creates learning content
        """
        print(f"\n{'='*60}")
        print(f"📚 PROCESSING: {filename}")
        print(f"{'='*60}")
        
        # Route to appropriate processor
        if content_type.startswith('image/') or filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            return await self._process_image_with_gpt4_vision(file_content, filename)
        
        elif filename.lower().endswith('.pdf'):
            return await self._process_pdf_complete(file_content, filename)
        
        elif content_type.startswith('text/') or filename.lower().endswith(('.txt', '.md')):
            text = file_content.decode('utf-8')
            return await self._process_text_with_gpt4(text, filename)
        
        else:
            try:
                text = file_content.decode('utf-8')
                return await self._process_text_with_gpt4(text, filename)
            except:
                print("⚠️  Unsupported file type")
                return self._create_fallback_content(filename)
    
    async def _process_pdf_complete(self, pdf_bytes: bytes, filename: str):
        """Extract ALL text from PDF and create comprehensive learning path"""
        
        try:
            import pdfplumber
            import io
            
            print("📖 Extracting text from PDF...")
            
            pdf_file = io.BytesIO(pdf_bytes)
            all_text = ""
            page_contents = []
            
            with pdfplumber.open(pdf_file) as pdf:
                total_pages = len(pdf.pages)
                print(f"   📄 PDF has {total_pages} pages")
                
                # Extract from all pages (limit to 20 for performance)
                for i, page in enumerate(pdf.pages[:20], 1):
                    text = page.extract_text()
                    if text:
                        page_contents.append({
                            'page': i,
                            'text': text
                        })
                        all_text += f"\n\n--- PAGE {i} ---\n\n{text}"
                        print(f"   ✓ Extracted page {i}/{min(total_pages, 20)}")
            
            if not all_text.strip():
                print("⚠️  No text found in PDF")
                return self._create_fallback_content(filename)
            
            total_chars = len(all_text)
            print(f"✅ Extracted {total_chars:,} characters from PDF\n")
            
            # Process with GPT-4 for comprehensive analysis
            return await self._analyze_content_with_gpt4(all_text, filename, page_contents)
        
        except ImportError:
            print("❌ pdfplumber not installed")
            print("   Install with: pip install pdfplumber")
            return self._create_fallback_content(filename)
        
        except Exception as e:
            print(f"❌ PDF extraction error: {e}")
            return self._create_fallback_content(filename)
    
    async def _process_image_with_gpt4_vision(self, image_bytes: bytes, filename: str):
        """Use GPT-4 Vision to extract content from images"""
        
        if not self.client:
            print("⚠️  No GPT-4 Vision available")
            return self._create_fallback_content(filename)
        
        try:
            print("👁️  Using GPT-4 Vision to analyze image...")
            
            # Convert to base64
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": """You are an expert educational content analyzer.

Analyze this image (could be handwritten notes, textbook pages, whiteboard photos, or diagrams).

Extract and organize ALL learning content:

1. READ every word, formula, diagram, and annotation
2. Identify 4-8 distinct learning concepts
3. For EACH concept, provide:
   - Clear concept name (specific, not generic)
   - Comprehensive explanation (3-4 sentences)
   - 4-6 specific key facts/points students must learn
   - Any formulas, equations, or important terms
   - Real-world applications or examples
   - Difficulty (1=basic recall, 5=advanced synthesis)
   - Prerequisites (what students need to know first)

Return JSON:
{
  "extracted_text": "complete transcription of all text",
  "document_type": "handwritten notes/textbook/whiteboard/diagram",
  "subject_area": "e.g., Physics, Biology, Math",
  "concepts": [
    {
      "concept_name": "Specific Concept Title",
      "explanation": "Detailed 3-4 sentence explanation",
      "key_facts": ["specific fact 1", "fact 2", "fact 3", "fact 4"],
      "formulas": ["equations if any"],
      "examples": ["practical examples"],
      "difficulty": 3,
      "prerequisites": ["what to know first"],
      "related_concepts": ["connected topics"]
    }
  ]
}

Be thorough and specific!"""
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=3000
            )
            
            result = json.loads(response.choices[0].message.content)
            concepts = result.get('concepts', [])
            
            print(f"✅ GPT-4 Vision extracted {len(concepts)} concepts")
            print(f"   Subject: {result.get('subject_area', 'Unknown')}")
            print(f"   Type: {result.get('document_type', 'Unknown')}")
            
            return self._format_learning_content(concepts, filename, result)
        
        except Exception as e:
            print(f"❌ GPT-4 Vision error: {e}")
            return self._create_fallback_content(filename)
    
    async def _process_text_with_gpt4(self, text: str, filename: str):
        """Process text content with GPT-4"""
        print("📝 Processing text content...")
        return await self._analyze_content_with_gpt4(text, filename, [])
    
    async def _analyze_content_with_gpt4(self, text: str, filename: str, page_info: List):
        """Deep content analysis with GPT-4"""
        
        if not self.client:
            print("⚠️  Using fallback analysis")
            return self._smart_text_analysis(text, filename)
        
        try:
            print("🤖 Deep analysis with GPT-4...")
            
            # Truncate if too long (GPT-4 context limit)
            text_sample = text[:12000]  # ~3000 tokens
            
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert educator creating adaptive learning content.

Your goal: Transform educational material into a structured learning path with:
- Clear concept progression (basic → intermediate → advanced)
- Specific, measurable learning objectives
- Rich explanations with context
- Real-world applications"""
                    },
                    {
                        "role": "user",
                        "content": f"""Analyze this educational content and create a comprehensive learning path:

{text_sample}

Extract 5-10 key concepts and organize them by difficulty.

For EACH concept provide:
1. **Concept Name**: Clear, specific title (5-8 words)
2. **Full Explanation**: Comprehensive 4-5 sentence explanation that teaches the concept
3. **Key Learning Points**: 5-7 specific facts/principles students must master
4. **Formulas/Equations**: Any mathematical expressions (in plain text or LaTeX)
5. **Real Examples**: 2-3 concrete, practical examples
6. **Difficulty**: Rate 1-5 where:
   - 1 = Basic recall/recognition
   - 2 = Understanding/explanation  
   - 3 = Application
   - 4 = Analysis/evaluation
   - 5 = Synthesis/creation
7. **Prerequisites**: What concepts must be understood first
8. **Common Misconceptions**: What students often get wrong
9. **Learning Objectives**: What students should be able to do after mastering this

Return comprehensive JSON:
{{
  "subject_area": "Main subject",
  "overall_difficulty": "beginner/intermediate/advanced",
  "estimated_learning_time": "time in minutes",
  "concepts": [
    {{
      "concept_name": "Specific Title",
      "explanation": "Full teaching explanation...",
      "key_facts": ["fact 1", "fact 2", ...],
      "formulas": ["equations"],
      "examples": ["example 1", "example 2"],
      "difficulty": 3,
      "prerequisites": ["concept needed first"],
      "misconceptions": ["common error"],
      "learning_objectives": ["students will be able to..."],
      "related_concepts": ["connected topics"]
    }}
  ]
}}"""
                    }
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            concepts = result.get('concepts', [])
            
            print(f"✅ GPT-4 analysis complete:")
            print(f"   • {len(concepts)} concepts identified")
            print(f"   • Subject: {result.get('subject_area', 'Unknown')}")
            print(f"   • Level: {result.get('overall_difficulty', 'Unknown')}")
            print(f"   • Learning time: {result.get('estimated_learning_time', 'Unknown')}")
            
            return self._format_learning_content(concepts, filename, result)
        
        except Exception as e:
            print(f"⚠️  GPT-4 analysis failed: {e}")
            return self._smart_text_analysis(text, filename)
    
    def _smart_text_analysis(self, text: str, filename: str):
        """Fallback: Smart analysis without GPT"""
        
        print("🧠 Using smart text analysis...")
        
        # Split into sections
        sections = self._split_into_sections(text)
        
        concepts = []
        for i, section in enumerate(sections[:8]):
            lines = [l.strip() for l in section.split('\n') if l.strip()]
            
            # Extract title
            title = lines[0] if lines else f"Concept {i+1}"
            title = re.sub(r'^#+\s*', '', title)
            title = re.sub(r'^\d+\.\s*', '', title)
            
            # Extract content
            content_lines = lines[1:]
            explanation = ' '.join(content_lines[:4])
            
            # Extract key facts
            key_facts = []
            for line in content_lines:
                if 20 < len(line) < 200:
                    if any(w in line.lower() for w in ['is', 'are', 'means', 'refers', 'defined', 'called']):
                        key_facts.append(line)
                if len(key_facts) >= 5:
                    break
            
            # Extract formulas
            formulas = []
            for line in content_lines:
                if any(c in line for c in ['=', '∫', '∑', '∂']):
                    formula = re.search(r'[A-Za-z]\s*=\s*[^\n]+', line)
                    if formula:
                        formulas.append(formula.group())
            
            difficulty = self._estimate_difficulty(section)
            
            concepts.append({
                'concept_name': title[:100],
                'explanation': explanation[:500],
                'key_facts': key_facts[:5],
                'formulas': formulas[:3],
                'examples': [],
                'difficulty': difficulty,
                'prerequisites': [],
                'misconceptions': [],
                'learning_objectives': [f"Understand {title}"]
            })
        
        print(f"✅ Smart analysis found {len(concepts)} concepts")
        
        return self._format_learning_content(concepts, filename, {})
    
    def _format_learning_content(self, concepts: List[Dict], source: str, metadata: Dict):
        """Format concepts into standardized learning content"""
        
        formatted = []
        
        for i, concept in enumerate(concepts):
            # Normalize difficulty to IRT scale (-1.5 to +1.5)
            raw_diff = concept.get('difficulty', 3)
            if 1 <= raw_diff <= 5:
                irt_difficulty = ((raw_diff - 3) / 2) * 1.5  # Maps 1→-1.5, 3→0, 5→+1.5
            else:
                irt_difficulty = raw_diff
            
            formatted.append({
                'id': str(uuid.uuid4()),
                'concept_name': concept.get('concept_name', f'Concept {i+1}'),
                'explanation': concept.get('explanation', ''),
                'key_facts': concept.get('key_facts', [])[:7],
                'formulas': concept.get('formulas', []),
                'examples': concept.get('examples', []),
                'difficulty': irt_difficulty,
                'prerequisites': concept.get('prerequisites', []),
                'misconceptions': concept.get('misconceptions', []),
                'learning_objectives': concept.get('learning_objectives', []),
                'related_concepts': concept.get('related_concepts', []),
                'source_file': source,
                'metadata': metadata
            })
        
        return formatted
    
    def _split_into_sections(self, text: str) -> List[str]:
        """Smart text splitting"""
        header_pattern = r'\n(?:#{1,6}\s+|\d+\.\s+|[A-Z][A-Za-z\s]{3,30}:?\n)'
        sections = re.split(header_pattern, text)
        
        if len(sections) < 3:
            sections = text.split('\n\n')
        
        return [s.strip() for s in sections if s.strip() and len(s.strip()) > 50]
    
    def _estimate_difficulty(self, text: str) -> float:
        """Estimate difficulty from text complexity"""
        difficulty = 0.0
        words = text.split()
        
        if words:
            avg_word_len = sum(len(w) for w in words) / len(words)
            if avg_word_len > 6:
                difficulty += 0.4
        
        technical_terms = ['theorem', 'hypothesis', 'derivative', 'integral', 'algorithm', 
                          'synthesis', 'mechanism', 'equilibrium', 'catalyst']
        if any(term in text.lower() for term in technical_terms):
            difficulty += 0.5
        
        if any(c in text for c in ['∫', '∑', '∂', '≈', '≤', '≥']):
            difficulty += 0.4
        
        return min(max(difficulty - 0.5, -1.0), 1.0)
    
    def _create_fallback_content(self, filename: str):
        """Fallback content when processing fails"""
        return [{
            'id': str(uuid.uuid4()),
            'concept_name': f'Content from {filename}',
            'explanation': 'Educational content extracted from uploaded file',
            'key_facts': ['Key learning point from uploaded material'],
            'formulas': [],
            'examples': [],
            'difficulty': 0.0,
            'prerequisites': [],
            'misconceptions': [],
            'learning_objectives': ['Understand core concepts'],
            'source_file': filename
        }]

advanced_processor = AdvancedContentProcessor()
