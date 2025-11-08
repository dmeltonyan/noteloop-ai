"""
Learning Style Service
Tracks and adapts to user learning styles
"""
from src.models.database import db
from typing import Dict, List, Optional
from datetime import datetime

class LearningStyleService:
    """
    Manages learning style assessment and adaptation
    """
    
    def __init__(self):
        self.questions = [
            {
                "id": "visual_1",
                "question": "When learning new material, I prefer:",
                "options": [
                    "Diagrams, charts, and visual aids",
                    "Written explanations and text",
                    "Listening to explanations",
                    "Hands-on practice and examples"
                ],
                "type": "visual_auditory_kinesthetic"
            },
            {
                "id": "pace_1",
                "question": "I learn best when:",
                "options": [
                    "I can go at my own pace",
                    "I follow a structured schedule",
                    "I have deadlines and pressure",
                    "I can explore freely"
                ],
                "type": "pace"
            },
            {
                "id": "difficulty_1",
                "question": "I prefer questions that are:",
                "options": [
                    "Easy - build my confidence",
                    "Moderate - balanced challenge",
                    "Hard - push my limits",
                    "Adaptive - match my level"
                ],
                "type": "difficulty_preference"
            },
            {
                "id": "feedback_1",
                "question": "I like feedback that is:",
                "options": [
                    "Immediate after each question",
                    "At the end of a session",
                    "Detailed explanations always",
                    "Quick and concise"
                ],
                "type": "feedback_preference"
            },
            {
                "id": "review_1",
                "question": "For reviewing material, I prefer:",
                "options": [
                    "Spaced repetition over time",
                    "Intensive cramming sessions",
                    "Regular daily practice",
                    "Review when I feel like it"
                ],
                "type": "review_preference"
            }
        ]
    
    def get_questionnaire(self) -> List[Dict]:
        """Get learning style questionnaire"""
        return self.questions
    
    def analyze_responses(self, responses: List[Dict]) -> Dict:
        """
        Analyze learning style from responses
        
        Args:
            responses: List of {question_id, answer_index}
        
        Returns:
            Learning style profile
        """
        profile = {
            "visual_auditory_kinesthetic": {"visual": 0, "auditory": 0, "kinesthetic": 0, "reading": 0},
            "pace": {"self_paced": 0, "structured": 0, "pressure": 0, "exploratory": 0},
            "difficulty_preference": {"easy": 0, "moderate": 0, "hard": 0, "adaptive": 0},
            "feedback_preference": {"immediate": 0, "delayed": 0, "detailed": 0, "concise": 0},
            "review_preference": {"spaced": 0, "cramming": 0, "daily": 0, "flexible": 0}
        }
        
        # Map answers to learning style dimensions
        answer_mapping = {
            "visual_1": {
                0: ("visual_auditory_kinesthetic", "visual"),
                1: ("visual_auditory_kinesthetic", "reading"),
                2: ("visual_auditory_kinesthetic", "auditory"),
                3: ("visual_auditory_kinesthetic", "kinesthetic")
            },
            "pace_1": {
                0: ("pace", "self_paced"),
                1: ("pace", "structured"),
                2: ("pace", "pressure"),
                3: ("pace", "exploratory")
            },
            "difficulty_1": {
                0: ("difficulty_preference", "easy"),
                1: ("difficulty_preference", "moderate"),
                2: ("difficulty_preference", "hard"),
                3: ("difficulty_preference", "adaptive")
            },
            "feedback_1": {
                0: ("feedback_preference", "immediate"),
                1: ("feedback_preference", "delayed"),
                2: ("feedback_preference", "detailed"),
                3: ("feedback_preference", "concise")
            },
            "review_1": {
                0: ("review_preference", "spaced"),
                1: ("review_preference", "cramming"),
                2: ("review_preference", "daily"),
                3: ("review_preference", "flexible")
            }
        }
        
        for response in responses:
            question_id = response.get("question_id")
            answer_index = response.get("answer_index")
            
            if question_id in answer_mapping and answer_index in answer_mapping[question_id]:
                dimension, value = answer_mapping[question_id][answer_index]
                profile[dimension][value] += 1
        
        # Determine primary learning style
        primary_style = {
            "visual_auditory_kinesthetic": max(profile["visual_auditory_kinesthetic"], 
                                               key=profile["visual_auditory_kinesthetic"].get),
            "pace": max(profile["pace"], key=profile["pace"].get),
            "difficulty": max(profile["difficulty_preference"], key=profile["difficulty_preference"].get),
            "feedback": max(profile["feedback_preference"], key=profile["feedback_preference"].get),
            "review": max(profile["review_preference"], key=profile["review_preference"].get)
        }
        
        return {
            "profile": profile,
            "primary_style": primary_style,
            "recommendations": self._generate_recommendations(primary_style)
        }
    
    def _generate_recommendations(self, primary_style: Dict) -> List[str]:
        """Generate learning recommendations based on style"""
        recommendations = []
        
        # Visual/Auditory/Kinesthetic recommendations
        vak = primary_style.get("visual_auditory_kinesthetic", "visual")
        if vak == "visual":
            recommendations.append("Prefer visual explanations with diagrams and charts")
        elif vak == "auditory":
            recommendations.append("Benefit from audio explanations and discussions")
        elif vak == "kinesthetic":
            recommendations.append("Learn best through hands-on practice and examples")
        else:
            recommendations.append("Prefer written explanations and text-based content")
        
        # Pace recommendations
        pace = primary_style.get("pace", "self_paced")
        if pace == "self_paced":
            recommendations.append("Study at your own pace with flexible scheduling")
        elif pace == "structured":
            recommendations.append("Follow a structured study plan with clear milestones")
        elif pace == "pressure":
            recommendations.append("Set deadlines and challenges to stay motivated")
        else:
            recommendations.append("Explore concepts freely with guided discovery")
        
        # Difficulty recommendations
        difficulty = primary_style.get("difficulty", "adaptive")
        if difficulty == "easy":
            recommendations.append("Start with easier questions to build confidence")
        elif difficulty == "moderate":
            recommendations.append("Prefer balanced challenge level")
        elif difficulty == "hard":
            recommendations.append("Push limits with challenging questions")
        else:
            recommendations.append("Adaptive difficulty matches your current level")
        
        return recommendations
    
    def save_learning_style(self, user_id: str, style_profile: Dict) -> Dict:
        """Save learning style profile to user"""
        user = db.get_user(user_id)
        if not user:
            return {"success": False, "error": "User not found"}
        
        user.learning_preferences["learning_style"] = style_profile
        user.learning_preferences["style_assessed_at"] = datetime.now().isoformat()
        
        return {"success": True, "profile": style_profile}

learning_style_service = LearningStyleService()


