"""
Exam Readiness Predictor
Predicts exam performance with confidence intervals
Based on current mastery, retention decay, and historical performance
"""
import math
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from src.algorithms.forgetting_curve import forgetting_curve

class ExamReadinessPredictor:
    """
    Predicts exam performance based on multiple factors
    """
    
    def __init__(self):
        self.confidence_level = 0.95  # 95% confidence interval
    
    def predict_exam_score(self, user_id: str, exam_concepts: List[str],
                          user_mastery: Dict[str, Dict], days_until_exam: int,
                          historical_performance: Optional[Dict] = None) -> Dict:
        """
        Predict exam score with confidence intervals
        
        Args:
            user_id: User identifier
            exam_concepts: List of concept IDs that will be on exam
            user_mastery: Dict mapping concept_id to mastery data:
                {
                    'mastery': float (0-1),
                    'last_review': datetime,
                    'memory_strength': float,
                    'times_reviewed': int
                }
            days_until_exam: Days until exam
            historical_performance: Optional historical performance data
        
        Returns:
            Dictionary with predictions:
            {
                'predicted_score': float (0-100),
                'confidence_interval': (lower, upper),
                'weak_areas': List[str],
                'recommendations': List[str]
            }
        """
        if not exam_concepts:
            return {
                'predicted_score': 0.0,
                'confidence_interval': (0.0, 0.0),
                'weak_areas': [],
                'recommendations': ['No exam concepts specified']
            }
        
        # Calculate predicted performance for each concept
        concept_predictions = []
        weak_areas = []
        
        for concept_id in exam_concepts:
            mastery_data = user_mastery.get(concept_id, {})
            mastery = mastery_data.get('mastery', 0.0)
            last_review = mastery_data.get('last_review')
            memory_strength = mastery_data.get('memory_strength', 1.0)
            
            # Predict retention at exam time
            if last_review:
                exam_time = datetime.now() + timedelta(days=days_until_exam)
                retention = forgetting_curve.calculate_retention(
                    last_review, memory_strength, exam_time
                )
            else:
                retention = 0.5  # Never reviewed = low retention
            
            # Predicted performance = mastery * retention
            predicted_performance = mastery * retention
            
            concept_predictions.append({
                'concept_id': concept_id,
                'predicted_performance': predicted_performance,
                'mastery': mastery,
                'retention': retention
            })
            
            # Identify weak areas (predicted performance < 0.7)
            if predicted_performance < 0.7:
                weak_areas.append(concept_id)
        
        # Calculate overall predicted score
        if concept_predictions:
            mean_performance = sum(cp['predicted_performance'] for cp in concept_predictions) / len(concept_predictions)
            predicted_score = mean_performance * 100
        else:
            predicted_score = 0.0
        
        # Calculate confidence interval
        if len(concept_predictions) > 1:
            # Standard deviation of predictions
            performances = [cp['predicted_performance'] for cp in concept_predictions]
            variance = sum((p - mean_performance) ** 2 for p in performances) / len(performances)
            std_dev = math.sqrt(variance)
            
            # 95% confidence interval (z-score = 1.96)
            margin_of_error = 1.96 * std_dev * 100
            lower_bound = max(0, predicted_score - margin_of_error)
            upper_bound = min(100, predicted_score + margin_of_error)
        else:
            # Single concept: wider confidence interval
            margin_of_error = 15  # ±15 points
            lower_bound = max(0, predicted_score - margin_of_error)
            upper_bound = min(100, predicted_score + margin_of_error)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            predicted_score, weak_areas, days_until_exam, concept_predictions
        )
        
        return {
            'predicted_score': round(predicted_score, 1),
            'confidence_interval': (round(lower_bound, 1), round(upper_bound, 1)),
            'weak_areas': weak_areas[:5],  # Top 5 weak areas
            'recommendations': recommendations,
            'concept_breakdown': concept_predictions,
            'days_until_exam': days_until_exam
        }
    
    def _generate_recommendations(self, predicted_score: float, weak_areas: List[str],
                                  days_until_exam: int, concept_predictions: List[Dict]) -> List[str]:
        """Generate study recommendations"""
        recommendations = []
        
        if predicted_score < 60:
            recommendations.append("⚠️ Focus on core concepts - you need significant improvement")
            recommendations.append(f"Review {len(weak_areas)} weak areas before exam")
        elif predicted_score < 75:
            recommendations.append("📚 Good progress! Focus on weak areas to improve")
            recommendations.append("Review concepts daily to maintain retention")
        elif predicted_score < 85:
            recommendations.append("✅ Strong performance! Fine-tune weak areas")
            recommendations.append("Practice regularly to maintain current level")
        else:
            recommendations.append("🎉 Excellent! You're well-prepared")
            recommendations.append("Maintain current study habits - you're on track")
        
        # Time-based recommendations
        if days_until_exam < 3:
            recommendations.append("⏰ Exam is soon - focus on high-impact reviews")
        elif days_until_exam < 7:
            recommendations.append("📅 One week left - prioritize weak concepts")
        else:
            recommendations.append(f"📆 {days_until_exam} days until exam - maintain consistent study")
        
        # Weak area recommendations
        if weak_areas:
            recommendations.append(f"🎯 Focus on {len(weak_areas)} concepts with low predicted performance")
        
        return recommendations
    
    def identify_focus_areas(self, concept_predictions: List[Dict], 
                           max_areas: int = 5) -> List[str]:
        """
        Identify top concepts to focus on for maximum improvement
        
        Returns:
            List of concept IDs ordered by improvement potential
        """
        # Sort by predicted performance (lowest first)
        sorted_concepts = sorted(
            concept_predictions,
            key=lambda x: x['predicted_performance']
        )
        
        return [c['concept_id'] for c in sorted_concepts[:max_areas]]

exam_predictor = ExamReadinessPredictor()


