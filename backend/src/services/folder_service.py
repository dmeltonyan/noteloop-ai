"""
Folder Service
Manages user folders and workspace organization
"""
from src.models.database import db
from datetime import datetime
from typing import Dict, List, Optional
import uuid

class FolderService:
    """
    Manages folders and workspace organization
    """
    
    def create_folder(self, user_id: str, name: str, color: str = "#667eea",
                     icon: str = "📁", description: str = "") -> Dict:
        """
        Create a new folder
        
        Args:
            user_id: User identifier
            name: Folder name
            color: Folder color (hex)
            icon: Folder icon (emoji or icon name)
            description: Folder description
        
        Returns:
            Folder dictionary
        """
        user = db.get_user(user_id)
        if not user:
            return {"success": False, "error": "User not found"}
        
        folder_id = str(uuid.uuid4())
        folder = {
            "id": folder_id,
            "name": name,
            "color": color,
            "icon": icon,
            "description": description,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "upload_ids": [],
            "quiz_ids": [],
            "settings": {
                "layout": "grid",  # grid, list, compact
                "sort_by": "date",  # date, name, mastery
                "theme": "default"  # default, dark, light, custom
            }
        }
        
        # Initialize folders list if not exists
        if not hasattr(user, 'folders') or user.folders is None:
            user.folders = []
        
        user.folders.append(folder)
        
        return {
            "success": True,
            "folder": folder
        }
    
    def update_folder(self, user_id: str, folder_id: str, updates: Dict) -> Dict:
        """Update folder properties"""
        user = db.get_user(user_id)
        if not user:
            return {"success": False, "error": "User not found"}
        
        if not hasattr(user, 'folders') or not user.folders:
            return {"success": False, "error": "No folders found"}
        
        folder = next((f for f in user.folders if f.get("id") == folder_id), None)
        if not folder:
            return {"success": False, "error": "Folder not found"}
        
        # Update properties
        for key, value in updates.items():
            if key in ["name", "color", "icon", "description"]:
                folder[key] = value
            elif key == "settings":
                folder["settings"].update(value)
        
        folder["updated_at"] = datetime.now().isoformat()
        
        return {
            "success": True,
            "folder": folder
        }
    
    def add_to_folder(self, user_id: str, folder_id: str, upload_id: str = None,
                     quiz_id: str = None) -> Dict:
        """Add upload or quiz to folder"""
        user = db.get_user(user_id)
        if not user:
            return {"success": False, "error": "User not found"}
        
        if not hasattr(user, 'folders') or not user.folders:
            return {"success": False, "error": "No folders found"}
        
        folder = next((f for f in user.folders if f.get("id") == folder_id), None)
        if not folder:
            return {"success": False, "error": "Folder not found"}
        
        if upload_id and upload_id not in folder["upload_ids"]:
            folder["upload_ids"].append(upload_id)
        
        if quiz_id and quiz_id not in folder["quiz_ids"]:
            folder["quiz_ids"].append(quiz_id)
        
        folder["updated_at"] = datetime.now().isoformat()
        
        return {
            "success": True,
            "folder": folder
        }
    
    def get_folders(self, user_id: str) -> List[Dict]:
        """Get all folders for user"""
        user = db.get_user(user_id)
        if not user:
            return []
        
        if not hasattr(user, 'folders') or not user.folders:
            return []
        
        return user.folders
    
    def delete_folder(self, user_id: str, folder_id: str) -> Dict:
        """Delete a folder"""
        user = db.get_user(user_id)
        if not user:
            return {"success": False, "error": "User not found"}
        
        if not hasattr(user, 'folders') or not user.folders:
            return {"success": False, "error": "No folders found"}
        
        user.folders = [f for f in user.folders if f.get("id") != folder_id]
        
        return {"success": True}

folder_service = FolderService()


