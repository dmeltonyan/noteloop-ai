"""
Intelligent Quiz Generator
Creates adaptive, high-quality quizzes from real content
Uses Bloom's Taxonomy for difficulty progression
"""

from openai import AsyncOpenAI
import os
import json
from typing import List, Dict
import uuid
import random

class IntelligentQuizGenerator:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        self.client = AsyncOpenAI(api_key=api_key) if api_key else None
        
        if self.client:
            print("✅ Intelligent Quiz Generator with GPT-4")
        else:
            print("⚠️  Quiz Generator (Template Mode)")
    
    async def generate_adaptive_quizzes(self, concept: Dict, num_questions: int = 4) -> List[Dict]:
        """
        Generate quizzes that test different cognitive levels:
        1. Remember (recall facts)
        2. Understand (explain concepts)
        3. Apply (use in new situations)
        4. Analyze (compare/contrast)
        """
        
        if self.client:
            return await self._generate_with_gpt4(concept, num_questions)
        else:
            return self._generate_smart_templates(concept, num_questions)
    
    async def _generate_with_gpt4(self, concept: Dict, num_questions: int):
        """Use GPT-4 to create pedagogically sound quizzes"""
        
        try:
            # Build rich context
            context = f"""Concept: {concept['concept_name']}

Explanation: {concept['explanation']}

Key Facts:
{chr(10).join(f"• {fact}" for fact in concept.get('key_facts', []))}

Formulas: {', '.join(concept.get('formulas', []))}

Examples: {', '.join(concept.get('examples', []))}

Common Misconceptions: {', '.join(concept.get('misconceptions', []))}

Learning Objectives: {', '.join(concept.get('learning_objectives', []))}"""
            
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert assessment designer creating educational quizzes.

Create questions that:
- Test genuine understanding (not just memorization)
- Use realistic scenarios and applications
- Have ONE clearly correct answer
- Have 3 plausible distractors (wrong but tempting)
- Include detailed explanations

Follow Bloom's Taxonomy for difficulty progression."""
                    },
                    {
                        "role": "user",
                        "content": f"""Create {num_questions} multiple-choice questions for this concept:

{context}

Requirements for each question:

**Question 1 (Easy - Remember/Recall):**
- Tests basic definition or key fact
- Direct recall from content
- Difficulty: 1-2/5

**Question 2 (Medium - Understand):**
- Tests comprehension and explanation
- Requires understanding, not just memorization
- Difficulty: 2-3/5

**Question 3 (Medium-Hard - Apply):**
- Tests application to new scenario
- Requires using concept in practice
- Difficulty: 3-4/5

**Question 4 (Hard - Analyze):**
- Tests analysis, comparison, or evaluation
- Requires deeper thinking
- Difficulty: 4-5/5

Each question must have:
- Clear, specific question text
- 4 options (1 correct, 3 plausible distractors)
- Detailed explanation (2-3 sentences explaining WHY)
- Difficulty rating (1-5)

Return JSON:
{{
  "questions": [
    {{
      "question": "Specific question text?",
      "correct_answer": "The correct answer",
      "options": ["correct", "plausible distractor 1", "plausible distractor 2", "plausible distractor 3"],
      "explanation": "Why this answer is correct and how it relates to the concept...",
      "difficulty": 2,
      "bloom_level": "remember/understand/apply/analyze",
      "hints": ["hint if student struggles"]
    }}
  ]
}}"""
                    }
                ],
                temperature=0.8,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            questions = result.get('questions', [])
            
            print(f"✅ Generated {len(questions)} high-quality quizzes")
            
            return self._normalize_quizzes(questions, concept)
        
        except Exception as e:
            print(f"⚠️  GPT-4 quiz generation failed: {e}")
            return self._generate_smart_templates(concept, num_questions)
    
    def _generate_smart_templates(self, concept: Dict, num_questions: int):
        """Generate intelligent quiz templates"""
        
        quizzes = []
        name = concept['concept_name']
        explanation = concept.get('explanation', '')
        facts = concept.get('key_facts', [])
        formulas = concept.get('formulas', [])
        examples = concept.get('examples', [])
        base_diff = concept.get('difficulty', 0.0)
        
        # Quiz 1: Definition (Easy)
        if explanation:
            quizzes.append({
                'id': str(uuid.uuid4()),
                'question': f"What is {name}?",
                'correct_answer': self._truncate(explanation, 120),
                'options': self._create_definition_options(explanation, name),
                'difficulty': base_diff - 0.4,
                'explanation': f"{name} is defined as: {explanation[:200]}",
                'bloom_level': 'remember'
            })
        
        # Quiz 2: Key Fact (Medium)
        if facts and len(facts) > 0:
            fact = facts[0]
            quizzes.append({
                'id': str(uuid.uuid4()),
                'question': f"Which statement about {name} is correct?",
                'correct_answer': fact,
                'options': self._create_fact_options(fact, name),
                'difficulty': base_diff,
                'explanation': f"This is accurate because: {fact}",
                'bloom_level': 'understand'
            })
        
        # Quiz 3: Application (Medium-Hard)
        if examples and len(examples) > 0:
            example = examples[0]
            quizzes.append({
                'id': str(uuid.uuid4()),
                'question': f"How would you apply {name} in practice?",
                'correct_answer': example,
                'options': self._create_application_options(example, name),
                'difficulty': base_diff + 0.3,
                'explanation': f"In practice, {name} is used: {example}",
                'bloom_level': 'apply'
            })
        
        # Quiz 4: Formula/Analysis (Hard)
        if formulas and len(formulas) > 0:
            formula = formulas[0]
            quizzes.append({
                'id': str(uuid.uuid4()),
                'question': f"What is the formula or principle for {name}?",
                'correct_answer': formula,
                'options': self._create_formula_options(formula),
                'difficulty': base_diff + 0.5,
                'explanation': f"The correct expression is: {formula}",
                'bloom_level': 'analyze'
            })
        elif len(facts) > 1:
            fact = facts[1]
            quizzes.append({
                'id': str(uuid.uuid4()),
                'question': f"When analyzing {name}, which principle is most important?",
                'correct_answer': fact,
                'options': self._create_analysis_options(fact, name),
                'difficulty': base_diff + 0.4,
                'explanation': f"The key principle is: {fact}",
                'bloom_level': 'analyze'
            })
        
        return self._normalize_quizzes(quizzes[:num_questions], concept)
    
    def _create_definition_options(self, correct: str, topic: str) -> List[str]:
        """Create plausible definition distractors"""
        options = [
            self._truncate(correct, 120),
            f"A concept opposite to {topic}",
            f"An outdated theory that preceded {topic}",
            f"A different principle unrelated to {topic}"
        ]
        random.shuffle(options)
        return options
    
    def _create_fact_options(self, correct: str, topic: str) -> List[str]:
        """Create fact-based distractors"""
        options = [
            correct,
            correct.replace("increases", "decreases").replace("higher", "lower").replace("more", "less"),
            f"This applies only in special cases",
            f"This is a common misconception about {topic}"
        ]
        random.shuffle(options)
        return options
    
    def _create_application_options(self, correct: str, topic: str) -> List[str]:
        """Create application distractors"""
        options = [
            correct,
            f"This would not be an effective use of {topic}",
            f"This contradicts the principles of {topic}",
            f"This is only theoretical, not practical"
        ]
        random.shuffle(options)
        return options
    
    def _create_formula_options(self, correct: str) -> List[str]:
        """Create formula distractors"""
        options = [correct]
        
        # Create variations
        if "=" in correct:
            options.append(correct.replace("=", "≈"))
            options.append(correct.replace("+", "-") if "+" in correct else correct + " + C")
            options.append(correct.replace("*", "/") if "*" in correct else correct.replace("+", "*"))
        else:
            options.extend([
                correct + " (approximately)",
                correct.replace("and", "or") if "and" in correct else correct + " in most cases",
                "None of the standard formulas apply"
            ])
        
        random.shuffle(options)
        return options[:4]
    
    def _create_analysis_options(self, correct: str, topic: str) -> List[str]:
        """Create analysis-level distractors"""
        options = [
            correct,
            f"The opposite principle should be prioritized",
            f"All aspects of {topic} are equally important",
            f"This is a secondary consideration"
        ]
        random.shuffle(options)
        return options
    
    def _truncate(self, text: str, length: int) -> str:
        """Truncate text"""
        return text[:length].strip() + ("..." if len(text) > length else "")
    
    def _normalize_quizzes(self, quizzes: List[Dict], concept: Dict) -> List[Dict]:
        """Normalize quiz format to IRT scale"""
        
        normalized = []
        
        for q in quizzes:
            # Normalize difficulty to IRT scale
            raw_diff = q.get('difficulty', concept.get('difficulty', 0.0))
            if isinstance(raw_diff, (int, float)):
                if 1 <= raw_diff <= 5:
                    irt_diff = ((raw_diff - 3) / 2) * 1.5
                else:
                    irt_diff = raw_diff
            else:
                irt_diff = 0.0
            
            # Ensure options
            options = q.get('options', [])
            correct = q.get('correct_answer', '')
            
            if len(options) < 4:
                while len(options) < 4:
                    options.append(f"Option {len(options) + 1}")
            
            if correct and correct not in options:
                options[0] = correct
            
            normalized.append({
                'id': q.get('id', str(uuid.uuid4())),
                'question': q.get('question', 'Question text'),
                'correct_answer': correct,
                'options': options[:4],
                'difficulty': irt_diff,
                'explanation': q.get('explanation', 'Explanation of answer'),
                'bloom_level': q.get('bloom_level', 'remember'),
                'hints': q.get('hints', [])
            })
        
        return normalized

quiz_generator = IntelligentQuizGenerator()
