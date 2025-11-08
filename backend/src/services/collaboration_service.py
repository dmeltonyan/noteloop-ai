"""
Collaboration Service
Manages study groups, sharing, and collaborative features
"""
from src.models.database import db
from datetime import datetime
from typing import Dict, List, Optional
import uuid
import secrets
import string

class CollaborationService:
    """
    Manages collaborative learning features
    """
    
    def create_study_group(self, creator_id: str, name: str, description: str = "",
                          is_public: bool = False) -> Dict:
        """
        Create a new study group
        
        Args:
            creator_id: User creating the group
            name: Group name
            description: Group description
            is_public: Whether group is public
        
        Returns:
            Group dictionary
        """
        group_id = str(uuid.uuid4())
        # Generate invite code for the group
        invite_code = self._generate_invite_code()
        
        group = {
            "id": group_id,
            "name": name,
            "description": description,
            "creator_id": creator_id,
            "is_public": is_public,
            "created_at": datetime.now().isoformat(),
            "members": [creator_id],
            "member_count": 1,
            "shared_folders": [],
            "shared_quizzes": [],
            "challenges": [],
            "leaderboard": {},
            "invite_code": invite_code,
            "invite_link": f"/collaboration/join/{invite_code}"
        }
        
        # Store invite code mapping
        if not hasattr(db, 'group_invites'):
            db.group_invites = {}
        db.group_invites[invite_code] = group_id
        
        # Store in database
        if not hasattr(db, 'study_groups_dict'):
            db.study_groups_dict = {}
        db.study_groups_dict[group_id] = group
        
        # Add to creator's groups
        creator = db.get_user(creator_id)
        if creator:
            creator.study_groups.add(group_id)
        
        return {
            "success": True,
            "group": group
        }
    
    def join_study_group(self, user_id: str, group_id: str, referrer_id: str = None) -> Dict:
        """Join a study group"""
        if not hasattr(db, 'study_groups_dict'):
            return {"success": False, "error": "No groups found"}
        
        group = db.study_groups_dict.get(group_id)
        if not group:
            return {"success": False, "error": "Group not found"}
        
        if user_id in group["members"]:
            return {"success": False, "error": "Already a member"}
        
        group["members"].append(user_id)
        group["member_count"] = len(group["members"])
        
        user = db.get_user(user_id)
        if user:
            user.study_groups.add(group_id)
        
        # Handle referral rewards
        if referrer_id and referrer_id != user_id:
            referrer = db.get_user(referrer_id)
            if referrer:
                referrer.referrals_made += 1
                referrals_count = referrer.referrals_made
                
                # Award credits for referrals
                credits_awarded = 10  # Base credits per referral
                referrer.learning_credits += credits_awarded
                
                # Check for milestone rewards (5 referrals)
                if referrals_count >= 5 and "5_referrals" not in referrer.referral_rewards_claimed:
                    referrer.referral_rewards_claimed.append("5_referrals")
                    referrer.learning_credits += 100  # Bonus for 5 referrals
                    referrer.study_coins += 50
                    milestone_reward = True
                else:
                    milestone_reward = False
                
                return {
                    "success": True,
                    "group": group,
                    "referral_reward": {
                        "credits_awarded": credits_awarded,
                        "total_referrals": referrals_count,
                        "milestone_reward": milestone_reward,
                        "milestone_credits": 100 if milestone_reward else 0,
                        "milestone_coins": 50 if milestone_reward else 0
                    }
                }
        
        return {
            "success": True,
            "group": group
        }
    
    def join_by_invite(self, user_id: str, invite_code: str) -> Dict:
        """Join a group using an invite code"""
        if not hasattr(db, 'group_invites'):
            return {"success": False, "error": "Invalid invite code"}
        
        group_id = db.group_invites.get(invite_code)
        if not group_id:
            return {"success": False, "error": "Invalid invite code"}
        
        # Get the group to find the creator/referrer
        group = db.study_groups_dict.get(group_id)
        if not group:
            return {"success": False, "error": "Group not found"}
        
        # Use creator as referrer
        referrer_id = group.get("creator_id")
        
        return self.join_study_group(user_id, group_id, referrer_id)
    
    def get_group_by_invite(self, invite_code: str) -> Optional[Dict]:
        """Get group details by invite code"""
        if not hasattr(db, 'group_invites'):
            return None
        
        group_id = db.group_invites.get(invite_code)
        if not group_id:
            return None
        
        return db.study_groups_dict.get(group_id)
    
    def _generate_invite_code(self) -> str:
        """Generate a unique invite code"""
        alphabet = string.ascii_uppercase + string.digits
        while True:
            code = ''.join(secrets.choice(alphabet) for _ in range(8))
            if not hasattr(db, 'group_invites') or code not in db.group_invites:
                return code
    
    def share_folder(self, user_id: str, group_id: str, folder_id: str) -> Dict:
        """Share a folder with study group"""
        if not hasattr(db, 'study_groups_dict'):
            return {"success": False, "error": "No groups found"}
        
        group = db.study_groups_dict.get(group_id)
        if not group:
            return {"success": False, "error": "Group not found"}
        
        if user_id not in group["members"]:
            return {"success": False, "error": "Not a member"}
        
        if folder_id not in group["shared_folders"]:
            group["shared_folders"].append({
                "folder_id": folder_id,
                "shared_by": user_id,
                "shared_at": datetime.now().isoformat()
            })
        
        return {"success": True, "group": group}
    
    def share_quiz(self, user_id: str, group_id: str, quiz_id: str) -> Dict:
        """Share a quiz with study group"""
        if not hasattr(db, 'study_groups_dict'):
            return {"success": False, "error": "No groups found"}
        
        group = db.study_groups_dict.get(group_id)
        if not group:
            return {"success": False, "error": "Group not found"}
        
        if user_id not in group["members"]:
            return {"success": False, "error": "Not a member"}
        
        if quiz_id not in [sq["quiz_id"] for sq in group["shared_quizzes"]]:
            group["shared_quizzes"].append({
                "quiz_id": quiz_id,
                "shared_by": user_id,
                "shared_at": datetime.now().isoformat()
            })
        
        return {"success": True, "group": group}
    
    def get_user_groups(self, user_id: str) -> List[Dict]:
        """Get all groups user belongs to"""
        user = db.get_user(user_id)
        if not user:
            return []
        
        if not hasattr(db, 'study_groups_dict'):
            db.study_groups_dict = {}
            return []
        
        groups = []
        for group_id in user.study_groups:
            group = db.study_groups_dict.get(group_id)
            if group:
                groups.append(group)
        
        return groups
    
    def get_public_groups(self) -> List[Dict]:
        """Get all public groups"""
        if not hasattr(db, 'study_groups_dict'):
            db.study_groups_dict = {}
            return []
        
        return [g for g in db.study_groups_dict.values() if g.get("is_public", False)]
    
    def create_challenge(self, creator_id: str, group_id: str, challenge_type: str,
                        target: int, duration_days: int = 7) -> Dict:
        """
        Create a group challenge
        
        Args:
            creator_id: User creating challenge
            group_id: Group ID
            challenge_type: 'questions', 'concepts', 'accuracy'
            target: Target number/percentage
            duration_days: Challenge duration
        """
        if not hasattr(db, 'study_groups_dict'):
            return {"success": False, "error": "No groups found"}
        
        group = db.study_groups_dict.get(group_id)
        if not group:
            return {"success": False, "error": "Group not found"}
        
        challenge_id = str(uuid.uuid4())
        challenge = {
            "id": challenge_id,
            "type": challenge_type,
            "target": target,
            "duration_days": duration_days,
            "created_by": creator_id,
            "created_at": datetime.now().isoformat(),
            "ends_at": (datetime.now().timestamp() + duration_days * 86400),
            "participants": {},
            "leaderboard": {}
        }
        
        group["challenges"].append(challenge)
        
        return {
            "success": True,
            "challenge": challenge
        }

collaboration_service = CollaborationService()

