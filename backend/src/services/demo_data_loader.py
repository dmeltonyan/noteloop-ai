from src.models.schema import db, User, Concept, Video, Quiz
import uuid

def load_demo_data():
    """Load demo content for testing"""
    
    if len(db.concepts) > 0:
        return
    
    print("📚 Loading demo learning content...")
    
    # Demo concepts
    demo_concepts = [
        {
            'topic': 'Active Recall',
            'description': 'Testing yourself retrieves information from memory, strengthening learning',
            'difficulty': -0.5,
            'video_script': 'Why do we forget things we just studied? The secret is active recall. Instead of re-reading notes, quiz yourself. When you struggle to remember and then succeed, you create stronger memory pathways. Try this: close your notes and write everything you remember. Then check. This simple technique can double your retention. Remember: the harder you work to recall, the stronger the memory becomes.',
            'quizzes': [
                {
                    'question': 'What is active recall?',
                    'options': ['Testing yourself without notes', 'Reading notes repeatedly', 'Listening to lectures', 'Writing summaries'],
                    'correct': 'Testing yourself without notes',
                    'difficulty': -0.6
                },
                {
                    'question': 'Why does active recall work?',
                    'options': ['It strengthens memory pathways', 'It saves time', 'It is easier than reading', 'It requires no effort'],
                    'correct': 'It strengthens memory pathways',
                    'difficulty': -0.3
                }
            ]
        },
        {
            'topic': 'Spaced Repetition',
            'description': 'Reviewing information at increasing intervals improves long-term retention',
            'difficulty': -0.3,
            'video_script': 'Ever cram for a test and forget everything a week later? There is a better way: spaced repetition. Instead of studying everything in one day, review material at increasing intervals: 1 day, 3 days, 1 week, 1 month. Each time you successfully recall information just before you would forget it, you strengthen that memory. Apps like Anki use this principle. The key: timing matters. Review too soon, its wasted effort. Too late, you have forgotten. Spaced repetition finds the sweet spot.',
            'quizzes': [
                {
                    'question': 'What is spaced repetition?',
                    'options': ['Reviewing at increasing intervals', 'Studying for hours straight', 'Cramming before tests', 'Reading notes once'],
                    'correct': 'Reviewing at increasing intervals',
                    'difficulty': -0.4
                },
                {
                    'question': 'Why is timing important in spaced repetition?',
                    'options': ['Review just before forgetting', 'Review as soon as possible', 'Review only once', 'Review randomly'],
                    'correct': 'Review just before forgetting',
                    'difficulty': 0.0
                }
            ]
        },
        {
            'topic': 'Growth Mindset',
            'description': 'Believing abilities can be developed through effort leads to greater achievement',
            'difficulty': 0.0,
            'video_script': 'Think intelligence is fixed? Think again. Stanford psychologist Carol Dweck discovered that believing your abilities can grow—a growth mindset—dramatically improves learning. When you face challenges, growth mindset says I cannot do this...yet. Fixed mindset says I am just not good at this. The difference? Growth mindset students embrace difficulty, learn from failure, and ultimately achieve more. Next time you struggle, add one word: yet. I do not understand this...yet. That simple shift can change everything.',
            'quizzes': [
                {
                    'question': 'What is growth mindset?',
                    'options': ['Believing abilities can be developed', 'Believing intelligence is fixed', 'Avoiding difficult tasks', 'Only doing what you are good at'],
                    'correct': 'Believing abilities can be developed',
                    'difficulty': -0.2
                },
                {
                    'question': 'How do growth mindset students view challenges?',
                    'options': ['As opportunities to learn', 'As threats to avoid', 'As proof they lack ability', 'As wastes of time'],
                    'correct': 'As opportunities to learn',
                    'difficulty': 0.1
                }
            ]
        },
        {
            'topic': 'Interleaving',
            'description': 'Mixing different topics during practice improves learning and retention',
            'difficulty': 0.3,
            'video_script': 'Here is a counterintuitive learning hack: mix it up. Most students practice one skill at a time—blocking. But research shows interleaving—mixing different but related skills—works better. Why? Your brain learns to discriminate between concepts and when to apply each. A pianist who practices scales, then chords, then timing separately will struggle more than one who mixes them. Yes, it feels harder. That is the point. That struggle is your brain making stronger connections. So next study session: mix your practice problems. Your future self will thank you.',
            'quizzes': [
                {
                    'question': 'What is interleaving?',
                    'options': ['Mixing different topics during practice', 'Focusing on one topic at a time', 'Taking frequent breaks', 'Studying in order'],
                    'correct': 'Mixing different topics during practice',
                    'difficulty': 0.2
                },
                {
                    'question': 'Why does interleaving feel harder?',
                    'options': ['Your brain is making stronger connections', 'You are doing it wrong', 'It is actually easier', 'It does not work'],
                    'correct': 'Your brain is making stronger connections',
                    'difficulty': 0.5
                }
            ]
        },
        {
            'topic': 'Metacognition',
            'description': 'Thinking about your own thinking improves learning strategies',
            'difficulty': 0.5,
            'video_script': 'The secret weapon of top learners? Metacognition—thinking about thinking. Before studying, ask: What do I already know? During: Does this make sense? After: What did I learn? This self-awareness transforms learning. Poor students read passively, never checking understanding. Strong students constantly monitor and adjust. Try the rubber duck technique: explain concepts aloud to an imaginary listener. If you stumble, you have found gaps in understanding. Metacognition is not just a skill—it is the skill that makes all other skills better. Know thyself. Know thy learning.',
            'quizzes': [
                {
                    'question': 'What is metacognition?',
                    'options': ['Thinking about your thinking', 'Memorizing facts', 'Taking notes', 'Reading textbooks'],
                    'correct': 'Thinking about your thinking',
                    'difficulty': 0.3
                },
                {
                    'question': 'How do strong learners use metacognition?',
                    'options': ['Monitor and adjust understanding', 'Read without thinking', 'Memorize everything', 'Avoid difficult material'],
                    'correct': 'Monitor and adjust understanding',
                    'difficulty': 0.6
                }
            ]
        }
    ]
    
    # Create concepts, videos, and quizzes
    for idx, concept_data in enumerate(demo_concepts):
        concept_id = str(uuid.uuid4())
        
        # Create concept
        concept = Concept(
            id=concept_id,
            subject='Learning Science',
            topic_name=concept_data['topic'],
            description=concept_data['description'],
            difficulty=concept_data['difficulty']
        )
        db.add_concept(concept)
        
        # Create video
        video = Video(
            id=str(uuid.uuid4()),
            concept_id=concept_id,
            title=f"Understanding {concept_data['topic']}",
            script=concept_data['video_script'],
            duration_seconds=60
        )
        db.add_video(video)
        
        # Create quizzes
        for quiz_data in concept_data['quizzes']:
            quiz = Quiz(
                id=str(uuid.uuid4()),
                concept_id=concept_id,
                question=quiz_data['question'],
                correct_answer=quiz_data['correct'],
                options=quiz_data['options'],
                difficulty=quiz_data['difficulty'],
                explanation=f"This tests understanding of {concept_data['topic']}"
            )
            db.add_quiz(quiz)
    
    # Create demo user
    demo_user = User(
        id="demo_user_123",
        name="Demo Student",
        email="demo@noteloop.ai"
    )
    db.add_user(demo_user)
    
    print(f"✅ Loaded {len(demo_concepts)} concepts with videos and quizzes")
    print(f"✅ Created demo user: {demo_user.id}")

load_demo_data()
