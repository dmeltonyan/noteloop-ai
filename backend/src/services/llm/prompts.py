"""
Prompt Templates for Structured Content Generation
All prompts designed to produce consistent JSON outputs
"""
from typing import List, Dict

class PromptTemplates:
    """Reusable prompt templates for learning content generation"""
    
    @staticmethod
    def extract_concepts(text: str) -> str:
        """Extract key concepts and topics from text"""
        return f"""Analyze the following text and extract structured learning information:

Text:
{text[:5000]}

Return a JSON object with this exact structure:
{{
  "topics": ["topic1", "topic2", "topic3"],
  "key_terms": ["term1", "term2", "term3"],
  "main_concepts": [
    {{
      "name": "Concept Name",
      "description": "Clear 2-3 sentence description",
      "importance": "high|medium|low",
      "related_topics": ["related1", "related2"]
    }}
  ],
  "summary": "2-3 sentence summary of the main content"
}}

Extract at least 3-5 main concepts. Be thorough and accurate."""
    
    @staticmethod
    def generate_summary(text: str, length: str = "medium") -> str:
        """Generate summary of text"""
        length_guide = {
            "short": "2-3 sentences",
            "medium": "1 paragraph (4-6 sentences)",
            "long": "2-3 paragraphs"
        }
        
        return f"""Create a {length_guide.get(length, "medium")} summary of the following text:

Text:
{text[:5000]}

Return JSON:
{{
  "summary": "The summary text here",
  "key_points": ["point1", "point2", "point3", "point4"],
  "word_count": <number>
}}"""
    
    @staticmethod
    def create_flashcards(concepts: List[Dict], count: int = 10) -> str:
        """Generate flashcards from concepts"""
        concepts_text = "\n".join([
            f"- {c.get('name', 'Concept')}: {c.get('description', '')[:200]}"
            for c in concepts[:10]
        ])
        
        return f"""Create {count} high-quality flashcards from these concepts:

Concepts:
{concepts_text}

Return JSON array:
{{
  "flashcards": [
    {{
      "front": "Question or prompt",
      "back": "Answer or explanation",
      "concept": "Related concept name",
      "difficulty": "easy|medium|hard",
      "confidence_tag": "low|medium|high"
    }}
  ]
}}

Make flashcards:
- Clear and concise
- Cover different difficulty levels
- Include key definitions and relationships
- Suitable for spaced repetition"""
    
    @staticmethod
    def generate_quiz(
        concepts: List[Dict],
        difficulty: str = "mixed",
        question_count: int = 10
    ) -> str:
        """Generate quiz questions using Bloom's taxonomy"""
        concepts_text = "\n".join([
            f"- {c.get('name', 'Concept')}: {c.get('description', '')[:200]}"
            for c in concepts[:10]
        ])
        
        difficulty_guide = {
            "easy": "Remember/Understand level (recall facts, basic understanding)",
            "medium": "Apply/Analyze level (use concepts, identify patterns)",
            "hard": "Evaluate/Create level (critique, synthesize, create solutions)",
            "mixed": "Mix of all difficulty levels"
        }
        
        return f"""Create {question_count} high-quality quiz questions from these concepts:

Concepts:
{concepts_text}

Difficulty Level: {difficulty_guide.get(difficulty, "mixed")}

Return JSON:
{{
  "questions": [
    {{
      "question": "Clear, well-written question",
      "options": ["option1", "option2", "option3", "option4"],
      "correct_answer": "option1",
      "explanation": "Why this answer is correct (2-3 sentences)",
      "difficulty": "easy|medium|hard",
      "bloom_level": "remember|understand|apply|analyze|evaluate|create",
      "concept": "Related concept name"
    }}
  ]
}}

Requirements:
- Each question must have exactly 4 options
- Options should be plausible (avoid obviously wrong answers)
- Explanations should be educational
- Cover different concepts evenly
- Use Bloom's taxonomy appropriately for difficulty level"""
    
    @staticmethod
    def study_plan(
        concepts: List[Dict],
        user_level: str = "intermediate",
        duration_days: int = 7
    ) -> str:
        """Generate adaptive study plan"""
        concepts_text = "\n".join([
            f"- {c.get('name', 'Concept')}: {c.get('description', '')[:200]}"
            for c in concepts[:15]
        ])
        
        return f"""Create a {duration_days}-day adaptive study plan for these concepts:

Concepts:
{concepts_text}

User Level: {user_level}

Return JSON:
{{
  "plan_name": "Descriptive plan name",
  "duration_days": {duration_days},
  "daily_sessions": [
    {{
      "day": 1,
      "focus_concepts": ["concept1", "concept2"],
      "activities": [
        {{
          "type": "flashcards|quiz|review|practice",
          "description": "What to do",
          "estimated_minutes": 15,
          "concepts": ["concept1"]
        }}
      ],
      "goals": ["goal1", "goal2"]
    }}
  ],
  "spaced_repetition_schedule": {{
    "day_1": ["concept1", "concept2"],
    "day_3": ["concept1"],
    "day_7": ["concept1", "concept2", "concept3"]
  }},
  "milestones": [
    {{
      "day": 3,
      "description": "Milestone description",
      "assessment": "How to check progress"
    }}
  ]
}}

Make the plan:
- Progressive (easier concepts first)
- Include spaced repetition
- Realistic time estimates
- Adaptive to user level
- Include review sessions"""
    
    @staticmethod
    def generate_topic_outline(text: str) -> str:
        """Generate hierarchical topic outline"""
        return f"""Create a detailed topic outline from this text:

Text:
{text[:5000]}

Return JSON:
{{
  "title": "Main topic title",
  "sections": [
    {{
      "title": "Section title",
      "level": 1,
      "subsections": [
        {{
          "title": "Subsection title",
          "level": 2,
          "key_points": ["point1", "point2"]
        }}
      ],
      "key_points": ["main point1", "main point2"]
    }}
  ],
  "estimated_study_time_minutes": <number>
}}"""
    
    @staticmethod
    def extract_spaced_repetition_metadata(concept: Dict) -> str:
        """Extract metadata for spaced repetition algorithm"""
        return f"""Analyze this concept for spaced repetition:

Concept: {concept.get('name', 'Unknown')}
Description: {concept.get('description', '')[:500]}

Return JSON:
{{
  "concept_id": "{concept.get('id', '')}",
  "initial_difficulty": "easy|medium|hard",
  "estimated_retention_time_hours": <number>,
  "prerequisite_concepts": ["concept1", "concept2"],
  "related_concepts": ["concept3", "concept4"],
  "review_priority": "high|medium|low",
  "tags": ["tag1", "tag2"]
}}"""


