"""
Tutor Verification Service
Manages tutor verification and credentials
"""
from src.models.database import db
from datetime import datetime
from typing import Dict, List, Optional
import uuid

class TutorVerificationService:
    """
    Manages tutor verification and credentials
    """
    
    def __init__(self):
        self.verification_requirements = {
            "education": ["degree", "certification", "teaching_license"],
            "experience": ["years_teaching", "subjects_taught", "student_count"],
            "credentials": ["resume", "transcript", "references"]
        }
    
    def submit_verification_request(self, user_id: str, application_data: Dict) -> Dict:
        """
        Submit tutor verification application
        
        Args:
            user_id: User applying to be a tutor
            application_data: {
                "education": {...},
                "experience": {...},
                "credentials": {...},
                "subjects": [...],
                "hourly_rate": float,
                "bio": str
            }
        """
        user = db.get_user(user_id)
        if not user:
            return {"success": False, "error": "User not found"}
        
        verification_id = str(uuid.uuid4())
        verification_request = {
            "id": verification_id,
            "user_id": user_id,
            "status": "pending",  # pending, approved, rejected, verified
            "submitted_at": datetime.now().isoformat(),
            "application_data": application_data,
            "reviewed_by": None,
            "reviewed_at": None,
            "rejection_reason": None
        }
        
        # Store verification request
        if not hasattr(db, 'tutor_verifications'):
            db.tutor_verifications = {}
        db.tutor_verifications[verification_id] = verification_request
        
        # Update user's tutor status
        if not hasattr(user, 'tutor_profile'):
            user.tutor_profile = {}
        user.tutor_profile["verification_status"] = "pending"
        user.tutor_profile["verification_id"] = verification_id
        
        return {
            "success": True,
            "verification_id": verification_id,
            "message": "Verification request submitted. Review typically takes 24-48 hours."
        }
    
    def approve_tutor(self, verification_id: str, reviewer_id: str) -> Dict:
        """Approve a tutor verification request"""
        if not hasattr(db, 'tutor_verifications'):
            return {"success": False, "error": "No verifications found"}
        
        verification = db.tutor_verifications.get(verification_id)
        if not verification:
            return {"success": False, "error": "Verification not found"}
        
        verification["status"] = "verified"
        verification["reviewed_by"] = reviewer_id
        verification["reviewed_at"] = datetime.now().isoformat()
        
        # Update user's tutor profile
        user = db.get_user(verification["user_id"])
        if user:
            if not hasattr(user, 'tutor_profile'):
                user.tutor_profile = {}
            user.tutor_profile["verification_status"] = "verified"
            user.tutor_profile["verified_at"] = datetime.now().isoformat()
            user.tutor_profile["subjects"] = verification["application_data"].get("subjects", [])
            user.tutor_profile["hourly_rate"] = verification["application_data"].get("hourly_rate", 0)
            user.tutor_profile["bio"] = verification["application_data"].get("bio", "")
        
        return {"success": True, "message": "Tutor verified successfully"}
    
    def get_tutor_profile(self, user_id: str) -> Dict:
        """Get tutor profile"""
        user = db.get_user(user_id)
        if not user:
            return {"verified": False}
        
        tutor_profile = getattr(user, 'tutor_profile', {})
        return {
            "verified": tutor_profile.get("verification_status") == "verified",
            "profile": tutor_profile
        }
    
    def get_verified_tutors(self, subject: Optional[str] = None) -> List[Dict]:
        """Get list of verified tutors, optionally filtered by subject"""
        verified_tutors = []
        
        for user in db.users.values():
            tutor_profile = getattr(user, 'tutor_profile', {})
            if tutor_profile.get("verification_status") == "verified":
                subjects = tutor_profile.get("subjects", [])
                if not subject or subject in subjects:
                    verified_tutors.append({
                        "user_id": user.id,
                        "name": user.name,
                        "subjects": subjects,
                        "hourly_rate": tutor_profile.get("hourly_rate", 0),
                        "bio": tutor_profile.get("bio", ""),
                        "verified_at": tutor_profile.get("verified_at", "")
                    })
        
        return verified_tutors

tutor_verification_service = TutorVerificationService()


