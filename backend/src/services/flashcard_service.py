"""
Flashcard Service
Generates flashcards from concepts and quizzes
"""
from src.models.database import db
import uuid

class FlashcardService:
    def generate_flashcards_from_quiz(self, quiz_id: str):
        """Generate a flashcard from a quiz"""
        quiz = db.get_quiz(quiz_id)
        if not quiz:
            return None
        
        flashcard = {
            'id': str(uuid.uuid4()),
            'quiz_id': quiz_id,
            'concept_id': quiz.concept_id,
            'front': quiz.question,
            'back': quiz.explanation,
            'hint': quiz.correct_answer,
            'difficulty': quiz.difficulty
        }
        
        return flashcard
    
    def generate_flashcards_from_concept(self, concept_id: str, num_cards: int = 1):
        """Generate flashcards from a concept"""
        concept = db.get_concept(concept_id)
        if not concept:
            return []
        
        flashcards = []
        
        # Create flashcards from concept description
        sentences = concept.description.split('. ')
        for i, sentence in enumerate(sentences[:num_cards]):
            if len(sentence.strip()) > 20:
                flashcard = {
                    'id': str(uuid.uuid4()),
                    'concept_id': concept_id,
                    'front': f"What is {concept.topic_name}?",
                    'back': sentence.strip() + '.',
                    'hint': concept.topic_name,
                    'difficulty': concept.difficulty
                }
                flashcards.append(flashcard)
        
        return flashcards
    
    def get_quizzes_as_flashcards(self, user_id: str, upload_id: str = None):
        """Get all quizzes as flashcards for a user"""
        user = db.get_user(user_id)
        if not user:
            return []
        
        if upload_id:
            quizzes = db.get_quizzes_by_upload(upload_id)
        else:
            quizzes = list(db.quizzes.values())
        
        flashcards = []
        for quiz in quizzes:
            flashcard = {
                'id': str(uuid.uuid4()),
                'quiz_id': quiz.id,
                'concept_id': quiz.concept_id,
                'front': quiz.question,
                'back': quiz.explanation,
                'hint': quiz.correct_answer,
                'difficulty': quiz.difficulty,
                'concept_name': quiz.concept_name,
                'options': quiz.options
            }
            flashcards.append(flashcard)
        
        return flashcards

flashcard_service = FlashcardService()
