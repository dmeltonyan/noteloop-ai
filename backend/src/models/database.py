from dataclasses import dataclass, field
from typing import Dict, List, Set
from datetime import datetime, timedelta
import uuid

@dataclass
class User:
    id: str
    name: str
    email: str
    overall_ability: float = 0.0
    concept_mastery: Dict[str, float] = field(default_factory=dict)
    total_questions: int = 0
    correct_answers: int = 0
    viewed_videos: Set[str] = field(default_factory=set)
    answered_questions: Set[str] = field(default_factory=set)
    quiz_history: List[Dict] = field(default_factory=list)
    upload_history: List[Dict] = field(default_factory=list)
    chat_history: List[Dict] = field(default_factory=list)
    learning_preferences: Dict[str, any] = field(default_factory=dict)
    
    # Spaced Repetition
    spaced_repetition: Dict[str, Dict] = field(default_factory=dict)  # concept_id -> {next_review, interval, ease_factor, times_reviewed}
    
    # Achievements
    achievements: Set[str] = field(default_factory=set)
    achievements_unlocked: List[Dict] = field(default_factory=list)  # {id, name, unlocked_at, description}
    
    # Study Streaks
    current_streak: int = 0
    longest_streak: int = 0
    last_study_date: str = ""  # ISO format date
    study_days: Set[str] = field(default_factory=set)  # Set of dates (YYYY-MM-DD)
    
    # Flashcard progress
    flashcard_progress: Dict[str, Dict] = field(default_factory=dict)  # flashcard_id -> {seen, correct, difficulty}
    
    # Study plans
    study_plans: List[Dict] = field(default_factory=list)
    active_study_plan: str = ""  # ID of active plan
    
    # Groups
    study_groups: Set[str] = field(default_factory=set)  # Group IDs user belongs to
    
    # Referrals
    referral_code: str = ""  # User's unique referral code
    referrals_made: int = 0  # Number of successful referrals
    referral_rewards_claimed: List[str] = field(default_factory=list)  # List of milestone rewards claimed (e.g., ["5_referrals"])
    
    # Rewards System
    learning_credits: int = 0  # Primary currency
    study_coins: int = 0  # Gamified currency
    knowledge_points: int = 0  # Educational currency
    reward_history: List[Dict] = field(default_factory=list)  # Reward transactions
    level: int = 1  # User level
    experience_points: int = 0  # XP for leveling
    
    # Advanced Learning Tracking
    metacognitive_data: Dict[str, Dict] = field(default_factory=dict)  # concept_id -> {confidence_history, performance_history}
    learning_velocity_history: List[Dict] = field(default_factory=list)  # Snapshot history
    performance_by_time: List[Dict] = field(default_factory=list)  # Performance by hour/day
    transfer_learning_data: Dict[str, Dict] = field(default_factory=dict)  # Transfer detection data
    
    # Folders and Workspace
    folders: List[Dict] = field(default_factory=list)  # User folders/workspaces
    saved_quizzes: List[Dict] = field(default_factory=list)  # Saved quizzes for review
    
    # Tutor Profile
    tutor_profile: Dict = field(default_factory=dict)  # Tutor verification and profile data

@dataclass
class Concept:
    id: str
    subject: str
    topic_name: str
    description: str
    difficulty: float
    source_text: str = ""
    upload_id: str = ""  # Track which upload this concept belongs to

@dataclass
class Video:
    id: str
    concept_id: str
    title: str
    script: str
    duration_seconds: int
    views: int = 0
    likes: int = 0
    upload_id: str = ""  # Track which upload this video belongs to

@dataclass
class Quiz:
    id: str
    concept_id: str
    question: str
    correct_answer: str
    options: List[str]
    difficulty: float
    explanation: str
    source_text: str = ""
    concept_name: str = ""
    upload_id: str = ""  # Track which upload this quiz belongs to

@dataclass
class Achievement:
    id: str
    name: str
    description: str
    icon: str
    category: str  # 'streak', 'mastery', 'practice', 'social'
    requirement: Dict  # Criteria for unlocking

@dataclass
class StudyGroup:
    id: str
    name: str
    creator_id: str
    members: Set[str]
    description: str
    created_at: str
    is_public: bool = True

@dataclass
class StudyPlan:
    id: str
    user_id: str
    name: str
    schedule: List[Dict]  # Daily tasks
    created_at: str
    duration_days: int
    is_active: bool = True

class InMemoryDatabase:
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.concepts: Dict[str, Concept] = {}
        self.videos: Dict[str, Video] = {}
        self.quizzes: Dict[str, Quiz] = {}
        self.uploads: Dict[str, Dict] = {}
        self.achievements: Dict[str, Achievement] = {}
        self.study_groups: Dict[str, StudyGroup] = {}
        self.study_groups_dict: Dict[str, Dict] = {}  # For collaboration service (dict format)
        self.study_plans: Dict[str, StudyPlan] = {}
        self.tutor_sessions: Dict[str, Dict] = {}  # session_id -> session data
        self.tutor_verifications: Dict[str, Dict] = {}  # verification_id -> verification data
        self.study_rooms: Dict[str, Dict] = {}  # room_id -> room data
        self.room_invites: Dict[str, str] = {}  # invite_code -> room_id
        self.group_invites: Dict[str, str] = {}  # invite_code -> group_id
        
        self._load_demo_data()
        self._initialize_achievements()
    
    def _load_demo_data(self):
        demo_user = User(
            id="demo_user_123",
            name="Demo User",
            email="demo@noteloop.ai"
        )
        self.add_user(demo_user)
        print("OK Demo loaded")
    
    def add_user(self, user: User):
        self.users[user.id] = user
    
    def get_user(self, user_id: str) -> User:
        return self.users.get(user_id)
    
    def get_concept(self, concept_id: str) -> Concept:
        return self.concepts.get(concept_id)
    
    def get_quiz(self, quiz_id: str) -> Quiz:
        return self.quizzes.get(quiz_id)
    
    def add_concept(self, concept: Concept):
        self.concepts[concept.id] = concept
    
    def add_video(self, video: Video):
        self.videos[video.id] = video
    
    def add_quiz(self, quiz: Quiz):
        self.quizzes[quiz.id] = quiz
    
    def add_upload(self, upload_id: str, upload_data: Dict):
        """Store upload metadata"""
        self.uploads[upload_id] = upload_data
    
    def get_upload(self, upload_id: str) -> Dict:
        """Get upload by ID"""
        return self.uploads.get(upload_id)
    
    def get_user_uploads(self, user_id: str) -> List[Dict]:
        """Get all uploads for a user"""
        user = self.get_user(user_id)
        if user:
            return user.upload_history
        return []
    
    def add_chat_message(self, user_id: str, message: Dict):
        """Add chat message to user history"""
        user = self.get_user(user_id)
        if user:
            user.chat_history.append(message)
            # Keep last 100 messages
            if len(user.chat_history) > 100:
                user.chat_history = user.chat_history[-100:]
    
    def get_chat_history(self, user_id: str) -> List[Dict]:
        """Get chat history for user"""
        user = self.get_user(user_id)
        if user:
            return user.chat_history
        return []
    
    def update_learning_preferences(self, user_id: str, preferences: Dict):
        """Update user learning preferences"""
        user = self.get_user(user_id)
        if user:
            user.learning_preferences.update(preferences)
    
    def get_quizzes_by_upload(self, upload_id: str) -> List[Quiz]:
        """Get all quizzes for a specific upload"""
        return [q for q in self.quizzes.values() if q.upload_id == upload_id]
    
    def get_concepts_by_upload(self, upload_id: str) -> List[Concept]:
        """Get all concepts for a specific upload"""
        return [c for c in self.concepts.values() if c.upload_id == upload_id]
    
    def get_latest_upload_id(self, user_id: str) -> str:
        """Get the most recent upload ID for a user"""
        user = self.get_user(user_id)
        if user and user.upload_history:
            return user.upload_history[-1].get('id', '')
        return ''
    
    def update_spaced_repetition(self, user_id: str, concept_id: str, sr_data: Dict):
        """Update spaced repetition data for a concept"""
        user = self.get_user(user_id)
        if user:
            user.spaced_repetition[concept_id] = sr_data
    
    def get_due_for_review(self, user_id: str) -> List[str]:
        """Get concept IDs due for spaced repetition review"""
        user = self.get_user(user_id)
        if not user:
            return []
        
        due_concepts = []
        today = datetime.now().date()
        
        for concept_id, sr_data in user.spaced_repetition.items():
            next_review_str = sr_data.get('next_review', '')
            if next_review_str:
                try:
                    next_review = datetime.fromisoformat(next_review_str).date()
                    if next_review <= today:
                        due_concepts.append(concept_id)
                except:
                    pass
        
        return due_concepts
    
    def unlock_achievement(self, user_id: str, achievement_id: str):
        """Unlock an achievement for a user"""
        user = self.get_user(user_id)
        achievement = self.achievements.get(achievement_id)
        
        if user and achievement and achievement_id not in user.achievements:
            user.achievements.add(achievement_id)
            user.achievements_unlocked.append({
                'id': achievement_id,
                'name': achievement.name,
                'description': achievement.description,
                'icon': achievement.icon,
                'unlocked_at': datetime.now().isoformat()
            })
            return True
        return False
    
    def update_study_streak(self, user_id: str):
        """Update study streak - call this when user studies"""
        user = self.get_user(user_id)
        if not user:
            return
        
        today = datetime.now().date().isoformat()
        yesterday = (datetime.now() - timedelta(days=1)).date().isoformat()
        
        if today in user.study_days:
            return  # Already counted today
        
        if user.last_study_date == yesterday:
            # Continue streak
            user.current_streak += 1
        elif user.last_study_date == today:
            pass  # Already counted
        else:
            # New streak
            user.current_streak = 1
        
        user.study_days.add(today)
        user.last_study_date = today
        
        if user.current_streak > user.longest_streak:
            user.longest_streak = user.current_streak
    
    def add_study_group(self, group: StudyGroup):
        """Add a study group"""
        self.study_groups[group.id] = group
    
    def get_study_group(self, group_id: str) -> StudyGroup:
        """Get a study group"""
        return self.study_groups.get(group_id)
    
    def add_study_plan(self, plan: StudyPlan):
        """Add a study plan"""
        self.study_plans[plan.id] = plan
    
    def get_user_study_plans(self, user_id: str) -> List[StudyPlan]:
        """Get all study plans for a user"""
        return [p for p in self.study_plans.values() if p.user_id == user_id]
    
    def _initialize_achievements(self):
        """Initialize default achievements"""
        achievements_data = [
            {'id': 'first_question', 'name': 'First Steps', 'description': 'Answer your first question', 'icon': '🎯', 'category': 'practice'},
            {'id': 'streak_3', 'name': 'Getting Started', 'description': '3 day study streak', 'icon': '🔥', 'category': 'streak'},
            {'id': 'streak_7', 'name': 'Week Warrior', 'description': '7 day study streak', 'icon': '⭐', 'category': 'streak'},
            {'id': 'streak_30', 'name': 'Month Master', 'description': '30 day study streak', 'icon': '👑', 'category': 'streak'},
            {'id': 'master_10', 'name': 'Scholar', 'description': 'Master 10 concepts', 'icon': '📚', 'category': 'mastery'},
            {'id': 'master_50', 'name': 'Expert', 'description': 'Master 50 concepts', 'icon': '🎓', 'category': 'mastery'},
            {'id': 'questions_100', 'name': 'Centurion', 'description': 'Answer 100 questions', 'icon': '💯', 'category': 'practice'},
            {'id': 'accuracy_90', 'name': 'Perfectionist', 'description': '90% accuracy rate', 'icon': '🏆', 'category': 'practice'},
            {'id': 'upload_5', 'name': 'Collector', 'description': 'Upload 5 documents', 'icon': '📖', 'category': 'practice'},
            {'id': 'flashcard_100', 'name': 'Flash Master', 'description': 'Complete 100 flashcards', 'icon': '⚡', 'category': 'practice'},
        ]
        
        for ach_data in achievements_data:
            achievement = Achievement(
                id=ach_data['id'],
                name=ach_data['name'],
                description=ach_data['description'],
                icon=ach_data['icon'],
                category=ach_data['category'],
                requirement={}
            )
            self.achievements[ach_data['id']] = achievement
    
    def add_tutor_session(self, user_id: str, session: Dict):
        """Add a tutor session"""
        session_id = session.get('id')
        if session_id:
            self.tutor_sessions[session_id] = session
            # Also store reference in user if needed
            user = self.get_user(user_id)
            if user:
                if not hasattr(user, 'tutor_sessions'):
                    user.tutor_sessions = []
                user.tutor_sessions.append(session_id)
    
    def get_tutor_session(self, user_id: str, session_id: str) -> Dict:
        """Get a tutor session by ID"""
        return self.tutor_sessions.get(session_id)
    
    def update_tutor_session(self, user_id: str, session_id: str, session: Dict):
        """Update a tutor session"""
        if session_id in self.tutor_sessions:
            self.tutor_sessions[session_id] = session
    
    def get_user_tutor_sessions(self, user_id: str) -> List[Dict]:
        """Get all tutor sessions for a user"""
        return [s for s in self.tutor_sessions.values() if s.get('user_id') == user_id]

db = InMemoryDatabase()
