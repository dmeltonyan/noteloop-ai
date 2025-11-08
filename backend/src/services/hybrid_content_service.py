"""Hybrid Content Service"""
from datetime import datetime
from src.models.database import db
from src.algorithms.irt_engine import irt_engine
from src.algorithms.multi_armed_bandit import mab_selector
from src.algorithms.interleaved_practice import interleaved_engine
from src.algorithms.forgetting_curve import forgetting_curve

class HybridContentService:
    def get_feed(self, user_id: str, limit: int = 30, upload_id: str = None):
        """Get personalized feed - filter by upload_id if provided"""
        try:
            user = db.get_user(user_id)
            if not user:
                return []
            
            feed = []
            sequence = 0
            
            # Get quizzes - filter by upload_id if provided
            if upload_id:
                quizzes = db.get_quizzes_by_upload(upload_id)
                concepts = db.get_concepts_by_upload(upload_id)
            else:
                quizzes = list(db.quizzes.values())
                concepts = list(db.concepts.values())
            
            print(f"📊 Generating feed: {len(concepts)} concepts, {len(quizzes)} quizzes" + (f" (upload: {upload_id})" if upload_id else ""))
            
            # Get unanswered quizzes for this upload
            all_quizzes = [q for q in quizzes if q.id not in user.answered_questions]
            
            if not all_quizzes:
                print("⚠️  No unanswered quizzes found - returning all quizzes")
                all_quizzes = list(quizzes)
            
            # Sort quizzes by difficulty match using IRT
            theta = user.overall_ability
            
            # Prioritize quizzes - use IRT to select optimal questions
            quiz_items = []
            for q in all_quizzes:
                concept = db.get_concept(q.concept_id)
                # Use concept name from quiz if available, otherwise from concept, or fallback
                concept_name = q.concept_name or (concept.topic_name if concept else 'Learning Concept')
                quiz_items.append({
                    'id': q.id,
                    'difficulty': q.difficulty,
                    'quiz': q,
                    'concept_name': concept_name
                })
            
            # Select most appropriate quizzes using IRT
            selected_quizzes = []
            available_ids = [item['id'] for item in quiz_items]
            
            for _ in range(min(limit, len(quiz_items))):
                if not quiz_items:
                    break
                    
                optimal = irt_engine.select_optimal_item(
                    theta,
                    quiz_items,
                    list(user.answered_questions)
                )
                
                if optimal:
                    q = optimal['quiz']
                    selected_quizzes.append(q)
                    # Remove selected quiz from items
                    quiz_items = [item for item in quiz_items if item['id'] != q.id]
                else:
                    # Fallback: just take first available
                    if quiz_items:
                        q = quiz_items[0]['quiz']
                        selected_quizzes.append(q)
                        quiz_items.pop(0)
            
            # Build feed with quizzes
            for q in selected_quizzes[:limit]:
                concept = db.get_concept(q.concept_id)
                # Ensure we have all required fields
                concept_name = q.concept_name or (concept.topic_name if concept else 'Learning Concept')
                source_text = q.source_text or (concept.source_text if concept else 'Source material from your uploaded documents.')
                
                feed.append({
                    'id': str(sequence),
                    'type': 'quiz',
                    'content': {
                        'id': q.id,
                        'concept_id': q.concept_id,
                        'question': q.question,
                        'options': q.options,
                        'correct_answer': q.correct_answer,
                        'difficulty': q.difficulty,
                        'explanation': q.explanation,
                        'source_text': source_text,
                        'concept_name': concept_name
                    },
                    'sequence': sequence
                })
                sequence += 1
            
            print(f"✅ Generated feed with {len(feed)} quiz items")
            return feed
            
        except Exception as e:
            print(f"❌ Feed error: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def submit_answer(self, user_id: str, quiz_id: str, user_answer: str, is_correct: bool):
        """Submit quiz answer"""
        try:
            user = db.get_user(user_id)
            quiz = db.get_quiz(quiz_id)
            
            if not user or not quiz:
                return {"success": False}
            
            # Update ability
            old_ability = user.overall_ability
            new_ability = irt_engine.update_ability(old_ability, quiz.difficulty, is_correct)
            user.overall_ability = new_ability
            
            # Update concept mastery
            concept = db.get_concept(quiz.concept_id)
            if concept:
                concept_ability = user.concept_mastery.get(concept.id, 0.0)
                if isinstance(concept_ability, dict):
                    concept_ability = concept_ability.get('mastery', 0.0)
                
                new_concept_ability = irt_engine.update_ability(concept_ability, quiz.difficulty, is_correct)
                mastery = irt_engine.calculate_mastery(new_concept_ability, concept.difficulty)
                
                user.concept_mastery[concept.id] = mastery
            
            # Update stats
            user.answered_questions.add(quiz_id)
            user.total_questions += 1
            if is_correct:
                user.correct_answers += 1
            
            ability_change = new_ability - old_ability
            mastery_pct = user.concept_mastery.get(quiz.concept_id, 0.0)
            if isinstance(mastery_pct, dict):
                mastery_pct = mastery_pct.get('mastery', 0.0)
            
            return {
                "success": True,
                "correct": is_correct,
                "explanation": quiz.explanation,
                "correct_answer": quiz.correct_answer if not is_correct else None,
                "ability_change": round(ability_change, 3),
                "new_ability": round(new_ability, 2),
                "concept_mastery": round(mastery_pct * 100, 1),
                "accuracy": round((user.correct_answers / user.total_questions * 100), 1) if user.total_questions > 0 else 0,
                "feedback": "🌟 Excellent!" if is_correct else "💡 Review the concept"
            }
            
        except Exception as e:
            print(f"❌ Submit error: {e}")
            import traceback
            traceback.print_exc()
            return {"success": False, "error": str(e)}

hybrid_service = HybridContentService()
