"""
LLM Content Generator
High-level functions for generating structured learning content
"""
from typing import Dict, List, Optional
from .client import llm_client
from .prompts import PromptTemplates
import json

class LLMContentGenerator:
    """
    Content generator using free LLM (Groq + Llama 3.1 70B)
    All methods return structured JSON for easy frontend integration
    """
    
    def __init__(self):
        self.client = llm_client
        self.prompts = PromptTemplates()
    
    async def extract_concepts(self, text: str) -> Dict:
        """
        Extract key concepts, topics, and terms from text
        
        Returns:
            {
                "topics": [...],
                "key_terms": [...],
                "main_concepts": [...],
                "summary": "..."
            }
        """
        prompt = self.prompts.extract_concepts(text)
        
        result = await self.client.generate_json(
            prompt=prompt,
            system_prompt="You are an expert at analyzing educational content and extracting structured information.",
            temperature=0.3
        )
        
        return result
    
    async def generate_summary(
        self,
        text: str,
        length: str = "medium"
    ) -> Dict:
        """
        Generate summary of text
        
        Args:
            text: Input text
            length: "short", "medium", or "long"
        
        Returns:
            {
                "summary": "...",
                "key_points": [...],
                "word_count": <number>
            }
        """
        prompt = self.prompts.generate_summary(text, length)
        
        result = await self.client.generate_json(
            prompt=prompt,
            system_prompt="You are an expert at creating clear, concise summaries.",
            temperature=0.4
        )
        
        return result
    
    async def create_flashcards(
        self,
        concepts: List[Dict],
        count: int = 10
    ) -> Dict:
        """
        Generate flashcards from concepts
        
        Args:
            concepts: List of concept dictionaries
            count: Number of flashcards to generate
        
        Returns:
            {
                "flashcards": [
                    {
                        "front": "...",
                        "back": "...",
                        "concept": "...",
                        "difficulty": "...",
                        "confidence_tag": "..."
                    }
                ]
            }
        """
        prompt = self.prompts.create_flashcards(concepts, count)
        
        result = await self.client.generate_json(
            prompt=prompt,
            system_prompt="You are an expert at creating effective flashcards for learning.",
            temperature=0.5
        )
        
        return result
    
    async def generate_quiz(
        self,
        concepts: List[Dict],
        difficulty: str = "mixed",
        question_count: int = 10
    ) -> Dict:
        """
        Generate quiz questions using Bloom's taxonomy
        
        Args:
            concepts: List of concept dictionaries
            difficulty: "easy", "medium", "hard", or "mixed"
            question_count: Number of questions to generate
        
        Returns:
            {
                "questions": [
                    {
                        "question": "...",
                        "options": [...],
                        "correct_answer": "...",
                        "explanation": "...",
                        "difficulty": "...",
                        "bloom_level": "...",
                        "concept": "..."
                    }
                ]
            }
        """
        prompt = self.prompts.generate_quiz(concepts, difficulty, question_count)
        
        result = await self.client.generate_json(
            prompt=prompt,
            system_prompt="You are an expert at creating high-quality educational quiz questions following Bloom's taxonomy.",
            temperature=0.4
        )
        
        return result
    
    async def study_plan(
        self,
        concepts: List[Dict],
        user_level: str = "intermediate",
        duration_days: int = 7
    ) -> Dict:
        """
        Generate adaptive study plan
        
        Args:
            concepts: List of concept dictionaries
            user_level: "beginner", "intermediate", or "advanced"
            duration_days: Number of days for the plan
        
        Returns:
            {
                "plan_name": "...",
                "duration_days": <number>,
                "daily_sessions": [...],
                "spaced_repetition_schedule": {...},
                "milestones": [...]
            }
        """
        prompt = self.prompts.study_plan(concepts, user_level, duration_days)
        
        result = await self.client.generate_json(
            prompt=prompt,
            system_prompt="You are an expert at creating effective, adaptive study plans.",
            temperature=0.5
        )
        
        return result
    
    async def generate_topic_outline(self, text: str) -> Dict:
        """
        Generate hierarchical topic outline
        
        Returns:
            {
                "title": "...",
                "sections": [...],
                "estimated_study_time_minutes": <number>
            }
        """
        prompt = self.prompts.generate_topic_outline(text)
        
        result = await self.client.generate_json(
            prompt=prompt,
            system_prompt="You are an expert at creating structured topic outlines.",
            temperature=0.3
        )
        
        return result
    
    async def extract_spaced_repetition_metadata(self, concept: Dict) -> Dict:
        """
        Extract metadata for spaced repetition algorithm
        
        Returns:
            {
                "concept_id": "...",
                "initial_difficulty": "...",
                "estimated_retention_time_hours": <number>,
                "prerequisite_concepts": [...],
                "related_concepts": [...],
                "review_priority": "...",
                "tags": [...]
            }
        """
        prompt = self.prompts.extract_spaced_repetition_metadata(concept)
        
        result = await self.client.generate_json(
            prompt=prompt,
            system_prompt="You are an expert at analyzing learning concepts for spaced repetition systems.",
            temperature=0.3
        )
        
        return result
    
    async def process_text(self, text: str) -> Dict:
        """
        Complete text processing pipeline
        Extracts concepts, generates summary, creates outline
        
        Returns:
            Combined result with all extracted information
        """
        # Run parallel extractions
        concepts_result = await self.extract_concepts(text)
        summary_result = await self.generate_summary(text)
        outline_result = await self.generate_topic_outline(text)
        
        return {
            "concepts": concepts_result,
            "summary": summary_result,
            "outline": outline_result,
            "processing_complete": True
        }

# Global instance
llm_generator = LLMContentGenerator()


