"""
Complete Supabase Service
Persistent storage for all learning data
"""

import os
from supabase import create_client, Client
from typing import Dict, List, Optional
from datetime import datetime

class SupabaseService:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        if url and key and "YOUR_PROJECT" not in url:
            try:
                self.client: Client = create_client(url, key)
                self.enabled = True
                print("✅ Supabase connected")
            except Exception as e:
                print(f"⚠️  Supabase connection failed: {e}")
                self.enabled = False
        else:
            self.enabled = False
            print("📊 Using in-memory storage (set SUPABASE_URL and SUPABASE_KEY in .env)")
    
    # ==================== USER OPERATIONS ====================
    
    def get_user(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        if not self.enabled:
            return None
        
        try:
            result = self.client.table('users').select('*').eq('id', user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error getting user: {e}")
            return None
    
    def create_user(self, user_data: Dict) -> Optional[Dict]:
        """Create new user"""
        if not self.enabled:
            return None
        
        try:
            result = self.client.table('users').insert(user_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating user: {e}")
            return None
    
    def update_user_progress(self, user_id: str, updates: Dict) -> bool:
        """Update user progress"""
        if not self.enabled:
            return False
        
        try:
            self.client.table('users').update(updates).eq('id', user_id).execute()
            return True
        except Exception as e:
            print(f"Error updating user: {e}")
            return False
    
    # ==================== CONCEPT OPERATIONS ====================
    
    def create_concept(self, concept_data: Dict) -> Optional[Dict]:
        """Create new concept"""
        if not self.enabled:
            return None
        
        try:
            result = self.client.table('concepts').insert(concept_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating concept: {e}")
            return None
    
    def get_all_concepts(self) -> List[Dict]:
        """Get all concepts"""
        if not self.enabled:
            return []
        
        try:
            result = self.client.table('concepts').select('*').execute()
            return result.data
        except Exception as e:
            print(f"Error getting concepts: {e}")
            return []
    
    # ==================== VIDEO OPERATIONS ====================
    
    def create_video(self, video_data: Dict) -> Optional[Dict]:
        """Create new video"""
        if not self.enabled:
            return None
        
        try:
            result = self.client.table('micro_lessons').insert(video_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating video: {e}")
            return None
    
    def get_videos_by_concept(self, concept_id: str) -> List[Dict]:
        """Get videos for a concept"""
        if not self.enabled:
            return []
        
        try:
            result = self.client.table('micro_lessons').select('*').eq('concept_id', concept_id).execute()
            return result.data
        except Exception as e:
            print(f"Error getting videos: {e}")
            return []
    
    # ==================== QUIZ OPERATIONS ====================
    
    def create_quiz(self, quiz_data: Dict) -> Optional[Dict]:
        """Create new quiz"""
        if not self.enabled:
            return None
        
        try:
            result = self.client.table('questions').insert(quiz_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating quiz: {e}")
            return None
    
    def get_quizzes_by_concept(self, concept_id: str) -> List[Dict]:
        """Get quizzes for a concept"""
        if not self.enabled:
            return []
        
        try:
            result = self.client.table('questions').select('*').eq('concept_id', concept_id).execute()
            return result.data
        except Exception as e:
            print(f"Error getting quizzes: {e}")
            return []
    
    # ==================== INTERACTION TRACKING ====================
    
    def record_interaction(self, interaction_data: Dict) -> bool:
        """Record user interaction (quiz answer)"""
        if not self.enabled:
            return False
        
        try:
            self.client.table('interactions').insert(interaction_data).execute()
            return True
        except Exception as e:
            print(f"Error recording interaction: {e}")
            return False
    
    def get_user_interactions(self, user_id: str, limit: int = 100) -> List[Dict]:
        """Get user's interaction history"""
        if not self.enabled:
            return []
        
        try:
            result = self.client.table('interactions')\
                .select('*')\
                .eq('user_id', user_id)\
                .order('created_at', desc=True)\
                .limit(limit)\
                .execute()
            return result.data
        except Exception as e:
            print(f"Error getting interactions: {e}")
            return []

supabase_service = SupabaseService()
