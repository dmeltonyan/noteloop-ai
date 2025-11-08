"""
Study Room Service
Manages private study rooms for tutoring sessions
"""
from src.models.database import db
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import uuid

class StudyRoomService:
    """
    Manages private study rooms for tutoring
    """
    
    def create_study_room(self, host_id: str, title: str, description: str = "",
                         subject: str = "", max_students: int = 10,
                         is_public: bool = False, scheduled_time: Optional[str] = None) -> Dict:
        """
        Create a private study room
        
        Args:
            host_id: User creating the room (no verification required)
            title: Room title
            description: Room description
            subject: Subject/topic
            max_students: Maximum students allowed
            is_public: Whether room is discoverable
            scheduled_time: Optional scheduled start time (ISO format)
        """
        user = db.get_user(host_id)
        if not user:
            return {"success": False, "error": "User not found"}
        
        room_id = str(uuid.uuid4())
        invite_code = self._generate_invite_code()
        
        room = {
            "id": room_id,
            "host_id": host_id,
            "host_name": user.name,
            "title": title,
            "description": description,
            "subject": subject,
            "max_students": max_students,
            "is_public": is_public,
            "status": "scheduled" if scheduled_time else "active",  # scheduled, active, ended
            "created_at": datetime.now().isoformat(),
            "scheduled_time": scheduled_time,
            "started_at": None,
            "ended_at": None,
            "students": [],
            "student_count": 0,
            "invite_code": invite_code,
            "invite_link": f"/study-room/{room_id}?invite={invite_code}",
            "screen_share_enabled": True,
            "ai_assistant_enabled": True,
            "whiteboard_enabled": True,
            "recording_enabled": False,
            "settings": {
                "allow_student_screen_share": False,
                "allow_chat": True,
                "allow_raise_hand": True
            }
        }
        
        # Store room
        if not hasattr(db, 'study_rooms'):
            db.study_rooms = {}
        db.study_rooms[room_id] = room
        
        # Store invite code mapping
        if not hasattr(db, 'room_invites'):
            db.room_invites = {}
        db.room_invites[invite_code] = room_id
        
        return {
            "success": True,
            "room": room,
            "invite_link": f"{room['invite_link']}"
        }
    
    def _generate_invite_code(self) -> str:
        """Generate a short, memorable invite code"""
        import random
        import string
        # Generate 8-character alphanumeric code
        chars = string.ascii_uppercase + string.digits
        return ''.join(random.choice(chars) for _ in range(8))
    
    def get_room_by_invite(self, invite_code: str) -> Optional[Dict]:
        """Get room by invite code"""
        if not hasattr(db, 'room_invites'):
            return None
        room_id = db.room_invites.get(invite_code)
        if room_id:
            return db.study_rooms.get(room_id)
        return None
    
    def join_study_room(self, user_id: str, room_id: str) -> Dict:
        """Join a study room"""
        if not hasattr(db, 'study_rooms'):
            return {"success": False, "error": "No rooms found"}
        
        room = db.study_rooms.get(room_id)
        if not room:
            return {"success": False, "error": "Room not found"}
        
        if room["status"] != "active" and room["status"] != "scheduled":
            return {"success": False, "error": "Room is not active"}
        
        if user_id in room["students"]:
            return {"success": False, "error": "Already in room"}
        
        if room["student_count"] >= room["max_students"]:
            return {"success": False, "error": "Room is full"}
        
        room["students"].append(user_id)
        room["student_count"] = len(room["students"])
        
        # Start room if host joins
        if user_id == room["host_id"] and room["status"] == "scheduled":
            room["status"] = "active"
            room["started_at"] = datetime.now().isoformat()
        
        return {
            "success": True,
            "room": room
        }
    
    def leave_study_room(self, user_id: str, room_id: str) -> Dict:
        """Leave a study room"""
        if not hasattr(db, 'study_rooms'):
            return {"success": False, "error": "No rooms found"}
        
        room = db.study_rooms.get(room_id)
        if not room:
            return {"success": False, "error": "Room not found"}
        
        if user_id in room["students"]:
            room["students"].remove(user_id)
            room["student_count"] = len(room["students"])
        
        # End room if host leaves
        if user_id == room["host_id"]:
            room["status"] = "ended"
            room["ended_at"] = datetime.now().isoformat()
        
        return {"success": True}
    
    def get_study_room(self, room_id: str) -> Optional[Dict]:
        """Get study room details"""
        if not hasattr(db, 'study_rooms'):
            return None
        return db.study_rooms.get(room_id)
    
    def get_host_rooms(self, host_id: str) -> List[Dict]:
        """Get all rooms created by a host"""
        if not hasattr(db, 'study_rooms'):
            return []
        return [r for r in db.study_rooms.values() if r["host_id"] == host_id]
    
    def get_public_rooms(self, subject: Optional[str] = None) -> List[Dict]:
        """Get public study rooms"""
        if not hasattr(db, 'study_rooms'):
            return []
        
        rooms = [r for r in db.study_rooms.values() 
                if r["is_public"] and r["status"] in ["scheduled", "active"]]
        
        if subject:
            rooms = [r for r in rooms if r["subject"] == subject]
        
        return rooms
    
    def get_ai_tutor_assistance(self, room_id: str, query: str, context: Dict) -> Dict:
        """
        Get AI assistance for tutor
        
        Args:
            room_id: Study room ID
            query: Tutor's question/request
            context: {
                "subject": str,
                "student_questions": List[str],
                "current_topic": str
            }
        """
        # In production, this would call an AI service
        # For now, return structured assistance
        
        subject = context.get("subject", "")
        current_topic = context.get("current_topic", "")
        
        assistance = {
            "suggestions": [
                f"Break down '{current_topic}' into smaller concepts",
                f"Use visual aids or diagrams to explain {current_topic}",
                f"Provide real-world examples related to {current_topic}",
                f"Check student understanding with quick questions"
            ],
            "explanation_framework": {
                "introduction": f"Start by explaining what {current_topic} is",
                "main_concepts": f"Cover the key aspects of {current_topic}",
                "examples": f"Provide 2-3 examples of {current_topic}",
                "practice": f"Give students a chance to practice {current_topic}"
            },
            "common_misconceptions": [
                f"Students often confuse {current_topic} with similar concepts",
                f"Watch out for common mistakes when explaining {current_topic}"
            ],
            "teaching_tips": [
                "Use analogies to make concepts relatable",
                "Encourage questions throughout",
                "Check for understanding frequently",
                "Adapt pace based on student responses"
            ]
        }
        
        return {
            "success": True,
            "assistance": assistance
        }

study_room_service = StudyRoomService()

