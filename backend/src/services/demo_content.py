from src.models.database import User, Concept, Video, Quiz
import uuid
def load_demo_content(db):
    user = User(id="demo_user_123", name="Demo", email="demo@noteloop.ai")
    db.add_user(user)
    for i in range(5):
        cid = f"concept_{i}"
        db.add_concept(Concept(id=cid, subject="Learning", topic_name=f"Concept {i}", description=f"Desc {i}", difficulty=0.0))
        db.add_video(Video(id=str(uuid.uuid4()), concept_id=cid, title=f"Video {i}", script=f"Script {i}", duration_seconds=60))
        db.add_quiz(Quiz(id=str(uuid.uuid4()), concept_id=cid, question=f"Q{i}?", correct_answer="A", options=["A","B","C","D"], difficulty=0.0, explanation="E"))
    print("✅ Demo loaded")
