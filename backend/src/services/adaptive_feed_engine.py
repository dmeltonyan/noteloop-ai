"""
Adaptive Feed Engine
Combines IRT, spaced repetition, and engagement signals
"""

from typing import List, Dict
from datetime import datetime
import random
from src.algorithms.irt_engine import irt_engine
from src.algorithms.spaced_repetition import sr_scheduler

class AdaptiveFeedEngine:
    """
    Intelligent feed that adapts to user ability and engagement
    """
    
    def __init__(self):
        self.video_quiz_ratio = 0.25  # Show quiz after ~4 videos
        self.exploration_rate = 0.15  # 15% of items for exploration
    
    def generate_personalized_feed(self, user_id: str, user_data: Dict,
                                   available_content: Dict, limit: int = 30) -> List[Dict]:
        """
        Generate personalized adaptive feed
        
        Args:
            user_id: User identifier
            user_data: User ability, mastery, history
            available_content: All available videos/quizzes
            limit: Number of items to return
        
        Returns:
            Ordered feed items optimized for learning
        """
        feed = []
        sequence = 0
        
        # Extract user stats
        theta = user_data.get('overall_ability', 0.0)
        concept_mastery = user_data.get('concept_mastery', {})
        answered_questions = user_data.get('answered_questions', [])
        viewed_videos = user_data.get('viewed_videos', [])
        
        # Get due reviews (spaced repetition)
        due_concepts = self._get_due_concepts(concept_mastery, datetime.now())
        
        # Organize content by concept
        concepts = available_content.get('concepts', [])
        videos = available_content.get('videos', [])
        quizzes = available_content.get('quizzes', [])
        
        # Build concept map
        concept_map = {}
        for concept in concepts:
            concept_map[concept['id']] = {
                'concept': concept,
                'videos': [v for v in videos if v['concept_id'] == concept['id']],
                'quizzes': [q for q in quizzes if q['concept_id'] == concept['id']]
            }
        
        # Select concepts to include (mix of optimal + exploration)
        selected_concepts = self._select_concepts(
            concepts, theta, concept_mastery, due_concepts, limit
        )
        
        # Build feed with optimal video/quiz sequencing
        for concept_id in selected_concepts:
            if len(feed) >= limit:
                break
            
            concept_content = concept_map.get(concept_id)
            if not concept_content:
                continue
            
            # Add video first (if available and not recently viewed)
            available_videos = [
                v for v in concept_content['videos'] 
                if v['id'] not in viewed_videos[-50:]  # Don't repeat last 50
            ]
            
            if available_videos:
                video = random.choice(available_videos)
                feed.append({
                    'id': str(sequence),
                    'type': 'video',
                    'content': video,
                    'sequence': sequence,
                    'concept_id': concept_id,
                    'reason': self._get_recommendation_reason(
                        concept_id, theta, concept_mastery
                    )
                })
                sequence += 1
            
            # Add quiz based on mastery and spacing
            if self._should_add_quiz(concept_id, concept_mastery, len(feed)):
                available_quizzes = [
                    q for q in concept_content['quizzes']
                    if q['id'] not in answered_questions[-100:]  # Don't repeat last 100
                ]
                
                if available_quizzes:
                    # Select optimal quiz using IRT
                    quiz = irt_engine.select_optimal_item(
                        theta, available_quizzes, answered_questions
                    )
                    
                    if quiz:
                        feed.append({
                            'id': str(sequence),
                            'type': 'quiz',
                            'content': quiz,
                            'sequence': sequence,
                            'concept_id': concept_id,
                            'difficulty': quiz.get('difficulty', 0.0),
                            'expected_success': irt_engine.probability_correct(
                                theta, quiz.get('difficulty', 0.0)
                            )
                        })
                        sequence += 1
        
        return feed
    
    def _select_concepts(self, concepts: List[Dict], theta: float,
                        mastery: Dict, due_concepts: List[str], limit: int) -> List[str]:
        """
        Select best concepts for current learning session
        """
        scored_concepts = []
        
        for concept in concepts:
            concept_id = concept['id']
            difficulty = concept.get('difficulty', 0.0)
            concept_mastery = mastery.get(concept_id, 0.0)
            
            # Calculate concept score
            score = self._score_concept(
                concept_id, difficulty, concept_mastery, theta, due_concepts
            )
            
            scored_concepts.append({
                'id': concept_id,
                'score': score,
                'difficulty': difficulty
            })
        
        # Sort by score (highest first)
        scored_concepts.sort(key=lambda x: x['score'], reverse=True)
        
        # Select top concepts with exploration
        num_concepts = min(limit // 3, len(scored_concepts))  # ~10 concepts for 30 items
        top_concepts = scored_concepts[:num_concepts]
        
        # Add exploration (random harder/easier concepts)
        exploration_count = int(num_concepts * self.exploration_rate)
        if exploration_count > 0 and len(scored_concepts) > num_concepts:
            exploration = random.sample(
                scored_concepts[num_concepts:],
                min(exploration_count, len(scored_concepts) - num_concepts)
            )
            top_concepts.extend(exploration)
        
        # Shuffle to avoid predictable patterns
        random.shuffle(top_concepts)
        
        return [c['id'] for c in top_concepts]
    
    def _score_concept(self, concept_id: str, difficulty: float,
                      mastery: float, theta: float, due_concepts: List[str]) -> float:
        """
        Score concept for inclusion in feed
        Higher score = higher priority
        """
        score = 0.0
        
        # Priority 1: Due for review (spaced repetition)
        if concept_id in due_concepts:
            score += 100.0
        
        # Priority 2: Optimal difficulty (near zone of proximal development)
        difficulty_gap = abs(difficulty - theta)
        if difficulty_gap < 0.3:
            score += 50.0  # Perfect difficulty
        elif difficulty_gap < 0.6:
            score += 30.0  # Good difficulty
        elif difficulty_gap < 1.0:
            score += 10.0  # Acceptable
        
        # Priority 3: Low mastery (needs work)
        if mastery < 0.3:
            score += 40.0  # Struggling - high priority
        elif mastery < 0.7:
            score += 20.0  # Learning - medium priority
        else:
            score += 5.0   # Mastered - low priority
        
        # Priority 4: Prerequisite concepts (not implemented yet, but placeholder)
        # If this is a prerequisite for other concepts user wants, boost score
        
        return score
    
    def _should_add_quiz(self, concept_id: str, mastery: Dict, 
                        current_feed_length: int) -> bool:
        """
        Decide if we should add a quiz after this video
        """
        concept_mastery = mastery.get(concept_id, 0.0)
        
        # Always quiz if struggling
        if concept_mastery < 0.4:
            return True
        
        # Quiz every ~4 items on average
        if random.random() < self.video_quiz_ratio:
            return True
        
        # Quiz every 5th item minimum
        if current_feed_length > 0 and current_feed_length % 5 == 0:
            return True
        
        return False
    
    def _get_due_concepts(self, mastery: Dict, current_time: datetime) -> List[str]:
        """
        Get concepts due for review
        """
        due = []
        
        for concept_id, data in mastery.items():
            if isinstance(data, dict):
                next_review = data.get('next_review')
                if next_review and next_review <= current_time:
                    due.append(concept_id)
            elif isinstance(data, float) and data < 0.7:
                # If low mastery, consider it due
                due.append(concept_id)
        
        return due
    
    def _get_recommendation_reason(self, concept_id: str, theta: float,
                                  mastery: Dict) -> str:
        """
        Generate explanation for why this content was recommended
        """
        concept_mastery = mastery.get(concept_id, 0.0)
        
        if concept_mastery < 0.3:
            return "📚 Keep practicing - you're building this skill"
        elif concept_mastery < 0.7:
            return "📈 You're making progress - let's reinforce this"
        elif concept_mastery > 0.8:
            return "⭐ Great mastery! Quick review to maintain"
        else:
            return "🎯 Matched to your current level"

adaptive_feed = AdaptiveFeedEngine()
