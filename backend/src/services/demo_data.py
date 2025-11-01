from src.models.database import db, Concept, Question, Lesson
import uuid

def load_demo_data():
    if len(db.concepts) > 0:
        return
    
    print("📚 Loading demo content...")
    
    demo_concepts = [
        {
            'name': 'Active Recall',
            'description': 'A study technique where you actively retrieve information from memory.',
            'difficulty': -0.5,
            'questions': [
                {'q': 'What is active recall?', 'a': 'Actively retrieving information from memory', 'diff': -0.6},
                {'q': 'Why is active recall effective?', 'a': 'It strengthens memory connections', 'diff': -0.3},
                {'q': 'How to practice active recall?', 'a': 'Use flashcards or practice questions', 'diff': 0.0},
            ]
        },
        {
            'name': 'Spaced Repetition',
            'description': 'Reviewing information at increasing intervals to improve retention.',
            'difficulty': -0.3,
            'questions': [
                {'q': 'What is spaced repetition?', 'a': 'Reviewing at increasing intervals', 'diff': -0.4},
                {'q': 'What is the forgetting curve?', 'a': 'Memory retention decreases over time', 'diff': 0.0},
                {'q': 'How does spaced repetition help?', 'a': 'Review before you forget', 'diff': 0.2},
            ]
        },
        {
            'name': 'Growth Mindset',
            'description': 'Belief that abilities can be developed through effort.',
            'difficulty': 0.0,
            'questions': [
                {'q': 'What is growth mindset?', 'a': 'Belief abilities can be developed', 'diff': -0.2},
                {'q': 'Growth vs fixed mindset?', 'a': 'Growth is malleable, fixed is static', 'diff': 0.1},
                {'q': 'How to develop growth mindset?', 'a': 'Embrace challenges, learn from criticism', 'diff': 0.3},
            ]
        },
        {
            'name': 'Metacognition',
            'description': 'Thinking about your own thinking.',
            'difficulty': 0.3,
            'questions': [
                {'q': 'What is metacognition?', 'a': 'Awareness of thought processes', 'diff': 0.0},
                {'q': 'Why is metacognition important?', 'a': 'Monitor understanding and adjust', 'diff': 0.3},
                {'q': 'Metacognitive strategies?', 'a': 'Self-questioning, reflection, planning', 'diff': 0.5},
            ]
        },
        {
            'name': 'Interleaving',
            'description': 'Mixing different topics during practice.',
            'difficulty': 0.5,
            'questions': [
                {'q': 'What is interleaving?', 'a': 'Mixing different topics', 'diff': 0.2},
                {'q': 'Why is interleaving effective?', 'a': 'Improves discrimination and retention', 'diff': 0.5},
                {'q': 'Interleaving vs blocking?', 'a': 'Interleaving mixes, blocking focuses', 'diff': 0.7},
            ]
        },
    ]
    
    for concept_data in demo_concepts:
        concept_id = str(uuid.uuid4())
        
        concept = Concept(
            id=concept_id,
            subject='Learning Science',
            name=concept_data['name'],
            description=concept_data['description'],
            difficulty=concept_data['difficulty']
        )
        db.add_concept(concept)
        
        for q_data in concept_data['questions']:
            question = Question(
                id=str(uuid.uuid4()),
                concept_id=concept_id,
                question=q_data['q'],
                answer=q_data['a'],
                difficulty=q_data['diff'],
                explanation=f"Understanding {concept_data['name']}"
            )
            db.add_question(question)
        
        lessons = {
            'comfortable': f"Review: {concept_data['name']}. {concept_data['description']} This reinforces what you know.",
            'optimal': f"Learn: {concept_data['name']}. {concept_data['description']} This builds on your knowledge.",
            'stretch': f"Master: {concept_data['name']}. {concept_data['description']} This challenges your understanding."
        }
        
        for zone, content in lessons.items():
            lesson = Lesson(
                id=str(uuid.uuid4()),
                concept_id=concept_id,
                title=f"{zone.title()}: {concept_data['name']}",
                content=content,
                difficulty_level=zone
            )
            db.add_lesson(lesson)
    
    print(f"✅ Loaded {len(demo_concepts)} demo concepts")

load_demo_data()
