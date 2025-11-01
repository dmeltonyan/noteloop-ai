from datetime import datetime
from typing import List, Dict
import uuid

# ==================== USER MODEL ====================
class User:
    def __init__(self, id: str, name: str, email: str):
        self.id = id
        self.name = name
        self.email = email
        self.created_at = datetime.now()
        self.concept_mastery = {}  # FIX: Added this
        self.mastery_per_concept = {}
        self.theta = 0.0
        self.overall_ability = 0.0
        self.total_questions = 0
        self.correct_answers = 0
        self.total_lessons_viewed = 0

# ==================== CONCEPT MODEL ====================
class Concept:
    def __init__(self, id: str, subject: str, topic_name: str, description: str, difficulty: float):
        self.id = id
        self.subject = subject
        self.topic_name = topic_name
        self.description = description
        self.difficulty = difficulty
        self.video_ids = []
        self.quiz_ids = []
        self.created_at = datetime.now()

# ==================== VIDEO MODEL ====================
class Video:
    def __init__(self, id: str, concept_id: str, title: str, script: str, duration_seconds: int):
        self.id = id
        self.concept_id = concept_id
        self.title = title
        self.script = script
        self.duration_seconds = duration_seconds
        self.url = f"/videos/{id}.mp4"
        self.thumbnail_url = f"/videos/{id}_thumb.jpg"
        self.helpful_likes = 0
        self.views = 0
        self.comments = []
        self.timestamps = {}
        self.created_at = datetime.now()

# ==================== QUIZ MODEL ====================
class Quiz:
    def __init__(self, id: str, concept_id: str, question: str, correct_answer: str, 
                 options: List[str], difficulty: float, explanation: str):
        self.id = id
        self.concept_id = concept_id
        self.question = question
        self.correct_answer = correct_answer
        self.options = options
        self.difficulty = difficulty
        self.explanation = explanation
        self.times_answered = 0
        self.times_correct = 0
        self.created_at = datetime.now()

# ==================== RESPONSE MODEL ====================
class Response:
    def __init__(self, id: str, user_id: str, quiz_id: str, user_answer: str, is_correct: bool):
        self.id = id
        self.user_id = user_id
        self.quiz_id = quiz_id
        self.user_answer = user_answer
        self.is_correct = is_correct
        self.timestamp = datetime.now()
        self.time_spent_seconds = 0

# ==================== COMMENT MODEL ====================
class Comment:
    def __init__(self, id: str, user_id: str, video_id: str, text: str, timestamp_seconds: int = 0):
        self.id = id
        self.user_id = user_id
        self.video_id = video_id
        self.text = text
        self.timestamp_seconds = timestamp_seconds
        self.likes = 0
        self.created_at = datetime.now()

# ==================== DATABASE ====================
class Database:
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.concepts: Dict[str, Concept] = {}
        self.videos: Dict[str, Video] = {}
        self.quizzes: Dict[str, Quiz] = {}
        self.responses: List[Response] = []
        self.comments: Dict[str, Comment] = {}
    
    def add_user(self, user: User):
        self.users[user.id] = user
    
    def get_user(self, user_id: str):
        return self.users.get(user_id)
    
    def add_concept(self, concept: Concept):
        self.concepts[concept.id] = concept
    
    def get_concept(self, concept_id: str):
        return self.concepts.get(concept_id)
    
    def get_all_concepts(self) -> List[Concept]:
        return list(self.concepts.values())
    
    def add_video(self, video: Video):
        self.videos[video.id] = video
        if video.concept_id in self.concepts:
            self.concepts[video.concept_id].video_ids.append(video.id)
    
    def get_video(self, video_id: str):
        return self.videos.get(video_id)
    
    def get_videos_by_concept(self, concept_id: str) -> List[Video]:
        concept = self.concepts.get(concept_id)
        if concept:
            return [self.videos[vid] for vid in concept.video_ids if vid in self.videos]
        return []
    
    def add_quiz(self, quiz: Quiz):
        self.quizzes[quiz.id] = quiz
        if quiz.concept_id in self.concepts:
            self.concepts[quiz.concept_id].quiz_ids.append(quiz.id)
    
    def get_quiz(self, quiz_id: str):
        return self.quizzes.get(quiz_id)
    
    def get_quizzes_by_concept(self, concept_id: str) -> List[Quiz]:
        concept = self.concepts.get(concept_id)
        if concept:
            return [self.quizzes[qid] for qid in concept.quiz_ids if qid in self.quizzes]
        return []
    
    def add_response(self, response: Response):
        self.responses.append(response)
        quiz = self.quizzes.get(response.quiz_id)
        if quiz:
            quiz.times_answered += 1
            if response.is_correct:
                quiz.times_correct += 1
        user = self.users.get(response.user_id)
        if user:
            user.total_questions += 1
            if response.is_correct:
                user.correct_answers += 1
    
    def add_comment(self, comment: Comment):
        self.comments[comment.id] = comment
        video = self.videos.get(comment.video_id)
        if video:
            video.comments.append(comment.id)

db = Database()
