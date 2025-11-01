from typing import List, Dict
import uuid
import re

class DocumentParser:
    """Parse uploaded documents and extract concepts"""
    
    async def parse_document(self, file_content: str, file_type: str) -> List[Dict]:
        """
        Parse document and extract key concepts
        Returns list of concepts with descriptions
        """
        
        # Simple parsing (can be enhanced with NLP/GPT)
        concepts = []
        
        # Split into sections
        sections = self._split_into_sections(file_content)
        
        for i, section in enumerate(sections):
            # Extract title and content
            lines = section.strip().split('\n')
            title = lines[0] if lines else f"Concept {i+1}"
            content = '\n'.join(lines[1:]) if len(lines) > 1 else ""
            
            # Create concept
            concept = {
                'id': str(uuid.uuid4()),
                'name': self._clean_title(title),
                'description': content[:500],  # First 500 chars
                'difficulty': self._estimate_difficulty(content),
                'keywords': self._extract_keywords(content)
            }
            
            concepts.append(concept)
        
        print(f"✅ Extracted {len(concepts)} concepts from document")
        return concepts
    
    def _split_into_sections(self, text: str) -> List[str]:
        """Split document into logical sections"""
        
        # Look for headers (lines in ALL CAPS, numbered, etc.)
        sections = []
        current_section = []
        
        lines = text.split('\n')
        
        for line in lines:
            # Check if this is likely a header
            if self._is_header(line):
                if current_section:
                    sections.append('\n'.join(current_section))
                current_section = [line]
            else:
                current_section.append(line)
        
        if current_section:
            sections.append('\n'.join(current_section))
        
        return sections if sections else [text]
    
    def _is_header(self, line: str) -> bool:
        """Detect if a line is likely a header"""
        line = line.strip()
        
        if not line:
            return False
        
        # Check various header patterns
        patterns = [
            r'^\d+\.?\s+[A-Z]',  # "1. Header" or "1 Header"
            r'^[A-Z][A-Z\s]+$',  # "ALL CAPS HEADER"
            r'^#+\s+',            # "# Markdown header"
            r'^\*{2,}.+\*{2,}',  # "**Bold header**"
        ]
        
        return any(re.match(pattern, line) for pattern in patterns)
    
    def _clean_title(self, title: str) -> str:
        """Clean up concept title"""
        # Remove markdown, numbers, special chars
        title = re.sub(r'^#+\s+', '', title)
        title = re.sub(r'^\d+\.?\s+', '', title)
        title = re.sub(r'\*{2,}', '', title)
        return title.strip()[:100]
    
    def _estimate_difficulty(self, text: str) -> float:
        """Estimate concept difficulty based on text complexity"""
        
        # Simple heuristics
        words = text.split()
        avg_word_length = sum(len(w) for w in words) / max(len(words), 1)
        
        # Longer words = harder content
        difficulty = (avg_word_length - 4) / 4
        
        # Clamp to -1 to 1 range
        return max(-1.0, min(1.0, difficulty))
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract key terms from text"""
        
        # Simple keyword extraction (can use NLP in production)
        words = re.findall(r'\b[A-Z][a-z]+\b', text)
        
        # Get unique words, limit to 10
        keywords = list(set(words))[:10]
        
        return keywords

# Global instance
document_parser = DocumentParser()
